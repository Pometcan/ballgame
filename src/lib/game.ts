import { World } from "./game/core/World";
import { globalSceneManager } from "./game/manager/SceneManager";
import { GameScene } from "./game/scene/GameScene";

export class game {
  private world: World;
  private canvas: HTMLCanvasElement;
  private isRunning: boolean = false;
  private lastTime: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    console.log(canvas.width)
    console.log(canvas.height)
    this.world = new World();
  }

  async initialize(): Promise<void> {
    globalSceneManager.setCanvas(this.canvas);

    const gameScene = new GameScene();

    globalSceneManager.addScene(gameScene);

    await globalSceneManager.changeScene('Game');
    this.start()
  }

  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }

  stop(): void {
    this.isRunning = false;
  }

  private gameLoop(currentTime: number): void {
    if (!this.isRunning) return;

    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    globalSceneManager.update(deltaTime);

    requestAnimationFrame((time) => this.gameLoop(time));
  }


  destroy(): void {
    this.stop();
    globalSceneManager.clear();
  }
}

