import { World } from "./game/core/World";
import { PlayerManager } from "./game/manager/PlayerManager";
import { globalEventManager, EventTypes } from "./game/manager/EventManager";
import { PlayerMovementSystem } from "./game/system/PlayerMovementSystem";
import Vector2 from "./game/util/vector2";

Vector2
export class game {
  private canvas: HTMLCanvasElement;
  private world: World;
  private playerManager: PlayerManager;
  private isRunning: boolean = false;
  private lastTime: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.world = new World();
    this.playerManager = new PlayerManager(this.world);

    this.setupSystems();
    this.setupEventListeners();
  }

  private setupSystems(): void {
    const movementSystem = new PlayerMovementSystem();
    this.world.addSystem(movementSystem);
  }

  private setupEventListeners(): void {
    globalEventManager.on(EventTypes.GAME_START, () => {
      console.log("Game started!");
    });

    globalEventManager.on(EventTypes.GAME_PAUSE, () => {
      console.log("Game paused!");
      this.pause();
    });

    globalEventManager.on(EventTypes.GAME_RESUME, () => {
      console.log("Game resumed!");
      this.resume();
    });

    globalEventManager.on(EventTypes.ENTITY_CREATED, (event) => {
      if (event.data?.playerId) {
        console.log(`Player ${event.data.playerId} joined the game!`);
      }
    });

    globalEventManager.on(EventTypes.KEY_DOWN, (event) => {
      switch (event.data?.key) {
        case 'escape':
          this.togglePause();
          break;
        case 'keyr':
          this.restart();
          break;
      }
    });
  }

  start(): void {
    if (!this.isRunning) {
      this.isRunning = true;


      this.lastTime = performance.now();
      requestAnimationFrame((time) => this.gameLoop(time));

      globalEventManager.emit(EventTypes.GAME_START);
    }
  }

  pause(): void {
    this.isRunning = false;
    globalEventManager.emit(EventTypes.GAME_PAUSE);
  }

  resume(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      requestAnimationFrame((time) => this.gameLoop(time));
      globalEventManager.emit(EventTypes.GAME_RESUME);
    }
  }

  togglePause(): void {
    if (this.isRunning) {
      this.pause();
    } else {
      this.resume();
    }
  }

  restart(): void {
    this.stop();
    this.start();
  }

  stop(): void {
    this.isRunning = false;
    this.world.clearEntity();
    this.world.clearSystems();
    this.setupSystems(); // Sistemleri yeniden ekle
    globalEventManager.emit(EventTypes.GAME_OVER);
  }

  private gameLoop(currentTime: number): void {
    if (!this.isRunning) return;

    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    try {
      this.playerManager.update(deltaTime);

      this.world.update(deltaTime);

      globalEventManager.processQueue();

    } catch (error) {
      console.error("Game loop error:", error);
    }

    requestAnimationFrame((time) => this.gameLoop(time));
  }

  addPlayer(playerId: string, config: any): void {
    this.playerManager.createPlayer(playerId, config);
  }

  removePlayer(playerId: string): void {
    this.playerManager.removePlayer(playerId);
  }

  getPlayer(playerId: string) {
    return this.playerManager.getPlayer(playerId);
  }

  getAllPlayers() {
    return this.playerManager.getAllPlayers();
  }

  getDebugInfo() {
    return {
      isRunning: this.isRunning,
      entityCount: this.world.getEntities().length,
      playerCount: this.getAllPlayers().length,
      eventManager: globalEventManager.getDebugInfo()
    };
  }

  destroy(): void {
    this.stop();
    this.playerManager.destroy();
    globalEventManager.clear();
  }
}

