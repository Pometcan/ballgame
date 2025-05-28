import { World } from '../core/World';
import { System } from '../core/System';
import { Entity } from '../core/Entity';
import { EventManager, EventTypes, type SceneEventData, globalEventManager } from './EventManager';

export interface SceneConfig {
  name: string;
  preload?: () => Promise<void>;
  systems?: System[];
  entities?: Entity[];
  data?: any;
}

export abstract class Scene {
  public readonly name: string;
  public readonly world: World;
  public readonly eventManager: EventManager;
  public isActive: boolean = false;
  public isLoaded: boolean = false;
  protected sceneData: any = {};

  constructor(name: string, eventManager?: EventManager) {
    this.name = name;
    this.world = new World();
    this.eventManager = eventManager || globalEventManager;
  }

  abstract preload(): Promise<void>;
  abstract create(): void;
  abstract update(deltaTime: number): void;
  abstract render(): void;
  abstract destroy(): void;

  async activate(): Promise<void> {
    if (this.isActive) return;

    if (!this.isLoaded) {
      await this.preload();
      this.isLoaded = true;
    }

    this.isActive = true;
    this.create();

    this.eventManager.emit(EventTypes.SCENE_LOADED, {
      newScene: this.name
    } as SceneEventData);
  }

  deactivate(): void {
    if (!this.isActive) return;

    this.isActive = false;
    this.destroy();

    this.eventManager.emit(EventTypes.SCENE_UNLOADED, {
      newScene: this.name
    } as SceneEventData);
  }

  setData(key: string, value: any): void {
    this.sceneData[key] = value;
  }

  getData(key: string): any {
    return this.sceneData[key];
  }

  protected addSystem(system: System): void {
    this.world.addSystem(system);
  }

  protected createEntity(): Entity {
    return this.world.createEntity();
  }

  protected getEntities(): Entity[] {
    return this.world.getEntities();
  }
}

export class SceneManager {
  private scenes: Map<string, Scene> = new Map();
  private currentScene: Scene | null = null;
  private transitionCallbacks: Map<string, (() => void)[]> = new Map();
  private eventManager: EventManager;

  constructor(eventManager?: EventManager) {
    this.eventManager = eventManager || globalEventManager;
  }

  addScene(scene: Scene): void {
    if (this.scenes.has(scene.name)) {
      console.warn(`Scene ${scene.name} already exists. Replacing...`);
    }
    this.scenes.set(scene.name, scene);
  }

  addScenes(scenes: Scene[]): void {
    scenes.forEach(scene => this.addScene(scene));
  }

  removeScene(sceneName: string): void {
    const scene = this.scenes.get(sceneName);
    if (scene) {
      if (scene === this.currentScene) {
        scene.deactivate();
        this.currentScene = null;
      }
      this.scenes.delete(sceneName);
    }
  }

  async changeScene(sceneName: string, data?: any): Promise<void> {
    const newScene = this.scenes.get(sceneName);
    if (!newScene) {
      throw new Error(`Scene ${sceneName} not found`);
    }

    const previousSceneName = this.currentScene?.name;

    await this.executeTransitionCallbacks(`${previousSceneName}->${sceneName}`);

    if (this.currentScene) {
      this.currentScene.deactivate();
    }

    if (data) {
      Object.keys(data).forEach(key => {
        newScene.setData(key, data[key]);
      });
    }

    await newScene.activate();
    this.currentScene = newScene;

    this.eventManager.emit(EventTypes.SCENE_CHANGE, {
      previousScene: previousSceneName,
      newScene: sceneName
    } as SceneEventData);
  }

  update(deltaTime: number): void {
    if (this.currentScene && this.currentScene.isActive) {
      this.currentScene.world.update(deltaTime);
      this.currentScene.update(deltaTime);
    }
  }

  render(): void {
    if (this.currentScene && this.currentScene.isActive) {
      this.currentScene.render();
    }
  }

  onTransition(from: string, to: string, callback: () => void): void {
    const key = `${from}->${to}`;
    if (!this.transitionCallbacks.has(key)) {
      this.transitionCallbacks.set(key, []);
    }
    this.transitionCallbacks.get(key)!.push(callback);
  }

  private async executeTransitionCallbacks(transitionKey: string): Promise<void> {
    const callbacks = this.transitionCallbacks.get(transitionKey);
    if (callbacks) {
      for (const callback of callbacks) {
        try {
          await callback();
        } catch (error) {
          console.error(`Error in transition callback for ${transitionKey}:`, error);
        }
      }
    }
  }

  getCurrentScene(): Scene | null {
    return this.currentScene;
  }

  getCurrentSceneName(): string | null {
    return this.currentScene?.name || null;
  }

  hasScene(sceneName: string): boolean {
    return this.scenes.has(sceneName);
  }

  getScene(sceneName: string): Scene | undefined {
    return this.scenes.get(sceneName);
  }

  getAllScenes(): Scene[] {
    return Array.from(this.scenes.values());
  }

  getSceneNames(): string[] {
    return Array.from(this.scenes.keys());
  }

  isSceneActive(sceneName: string): boolean {
    return this.currentScene?.name === sceneName && this.currentScene.isActive;
  }

  isSceneLoaded(sceneName: string): boolean {
    const scene = this.scenes.get(sceneName);
    return scene?.isLoaded || false;
  }

  clear(): void {
    if (this.currentScene) {
      this.currentScene.deactivate();
    }

    this.scenes.forEach(scene => {
      if (scene.isActive) {
        scene.deactivate();
      }
    });

    this.scenes.clear();
    this.currentScene = null;
    this.transitionCallbacks.clear();
  }

  getDebugInfo(): {
    totalScenes: number;
    currentScene: string | null;
    loadedScenes: string[];
    activeScene: string | null;
  } {
    const loadedScenes = Array.from(this.scenes.values())
      .filter(scene => scene.isLoaded)
      .map(scene => scene.name);

    return {
      totalScenes: this.scenes.size,
      currentScene: this.getCurrentSceneName(),
      loadedScenes,
      activeScene: this.currentScene?.isActive ? this.currentScene.name : null
    };
  }
}

export const globalSceneManager = new SceneManager();
