import { World } from '../core/World';
import { System } from '../core/System';
import { Entity } from '../core/Entity';
import { EventTypes, globalEventManager } from './EventManager';
import { RenderSystem } from '../system/RenderSystem';

export abstract class Scene {
  public readonly name: string;
  public readonly world: World;
  public isActive: boolean = false;
  public isLoaded: boolean = false;
  protected sceneData: Map<string, any> = new Map();

  constructor(name: string) {
    this.name = name;
    this.world = new World();
  }

  // Sahne yaşam döngüsü metodları
  abstract preload(): Promise<void>;
  abstract create(): void;
  abstract update(deltaTime: number): void;
  abstract destroy(): void;

  // Sahne aktivasyonu
  async activate(): Promise<void> {
    if (this.isActive) return;

    if (!this.isLoaded) {
      await this.preload();
      this.isLoaded = true;
    }

    this.create();
    this.isActive = true;

    globalEventManager.emit(EventTypes.SCENE_LOADED, {
      newScene: this.name
    });
  }

  // Sahne deaktivasyonu
  deactivate(): void {
    if (!this.isActive) return;

    this.destroy();
    this.isActive = false;

    globalEventManager.emit(EventTypes.SCENE_UNLOADED, {
      newScene: this.name
    });
  }

  // Veri yönetimi
  setData(key: string, value: any): void {
    this.sceneData.set(key, value);
  }

  getData(key: string): any {
    return this.sceneData.get(key);
  }

  hasData(key: string): boolean {
    return this.sceneData.has(key);
  }

  // World yardımcı metodları
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
  private renderSystem: RenderSystem | null = null;

  // Canvas'ı ayarla ve RenderSystem'i oluştur
  setCanvas(canvas: HTMLCanvasElement): void {
    this.renderSystem = new RenderSystem(canvas);
  }

  // Sahne ekleme/kaldırma
  addScene(scene: Scene): void {
    if (this.scenes.has(scene.name)) {
      console.warn(`Scene '${scene.name}' already exists. Replacing...`);
    }
    this.scenes.set(scene.name, scene);
  }

  removeScene(sceneName: string): boolean {
    const scene = this.scenes.get(sceneName);
    if (!scene) return false;

    // Eğer aktif sahne siliniyorsa önce deaktive et
    if (scene === this.currentScene) {
      scene.deactivate();
      this.currentScene = null;
    }

    this.scenes.delete(sceneName);
    return true;
  }

  // Sahne değiştirme
  async changeScene(sceneName: string, data?: Record<string, any>): Promise<void> {
    const newScene = this.scenes.get(sceneName);
    if (!newScene) {
      throw new Error(`Scene '${sceneName}' not found`);
    }

    const previousSceneName = this.currentScene?.name;

    // Önceki sahneyi deaktive et
    if (this.currentScene) {
      this.currentScene.deactivate();
    }

    // Yeni sahneye veri aktar
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        newScene.setData(key, value);
      });
    }

    // Yeni sahneyi aktive et
    await newScene.activate();
    this.currentScene = newScene;

    // Event gönder
    globalEventManager.emit(EventTypes.SCENE_CHANGE, {
      previousScene: previousSceneName,
      newScene: sceneName
    });
  }

  // Ana güncellemeler ve render
  update(deltaTime: number): void {
    if (!this.currentScene?.isActive || !this.renderSystem) return;

    // Sahne logic'ini güncelle
    this.currentScene.world.update(deltaTime);
    this.currentScene.update(deltaTime);

    // Aktif sahnedeki tüm entity'leri render et
    const entities = this.currentScene.world.getEntities();
    this.renderSystem.update(entities, deltaTime);
  }

  // Getter metodları
  getCurrentScene(): Scene | null {
    return this.currentScene;
  }

  getCurrentSceneName(): string | null {
    return this.currentScene?.name || null;
  }

  getScene(sceneName: string): Scene | undefined {
    return this.scenes.get(sceneName);
  }

  hasScene(sceneName: string): boolean {
    return this.scenes.has(sceneName);
  }

  isSceneActive(sceneName: string): boolean {
    return this.currentScene?.name === sceneName && this.currentScene.isActive;
  }

  isSceneLoaded(sceneName: string): boolean {
    const scene = this.scenes.get(sceneName);
    return scene?.isLoaded || false;
  }

  // Temizlik
  clear(): void {
    // Aktif sahneyi deaktive et
    if (this.currentScene) {
      this.currentScene.deactivate();
    }

    // Tüm sahneleri temizle
    this.scenes.forEach(scene => {
      if (scene.isActive) {
        scene.deactivate();
      }
    });

    this.scenes.clear();
    this.currentScene = null;

    // RenderSystem'i temizle
    if (this.renderSystem) {
      this.renderSystem.destroy();
      this.renderSystem = null;
    }
  }

  // Debug bilgileri
  getDebugInfo() {
    const loadedScenes = Array.from(this.scenes.values())
      .filter(scene => scene.isLoaded)
      .map(scene => scene.name);

    return {
      totalScenes: this.scenes.size,
      currentScene: this.getCurrentSceneName(),
      loadedScenes,
      activeScene: this.currentScene?.isActive ? this.currentScene.name : null,
      sceneNames: Array.from(this.scenes.keys())
    };
  }
}

export const globalSceneManager = new SceneManager();
