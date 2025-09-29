import { Transform } from "../components/transform";
import { PhysicsConfig } from "../components/PhysicsConfig";
import { CreateBall } from "../entities/ball";
import { CreatePlayer } from "../entities/player";
import { CreateWall } from "../entities/wall";
import { Scene } from "../manager/SceneManager";
import { InputSystem } from "../system/InputSystem";
import { MovementSystem } from "../system/MovementSystem";
import { PhysicsSystem } from "../system/PhysicsSystem";
import { PlayerControlSystem } from "../system/PlayerControlSystem";

import Vector2 from "../util/vector2";

export class GameScene extends Scene {
  constructor() {
    super('Game');
  }

  async preload(): Promise<void> {
    console.log('Loading game assets...');
    // Game için gerekli asset'leri yükle
  }

  create(): void {
    console.log('Game scene created');

    // Fizik konfigürasyonu - 1920x1080 canvas için optimize edilmiş
    const physicsConfig = new PhysicsConfig(
      new Vector2(0, 150),  // Daha yumuşak gravity
      1,                    // Normal gravity scale
      0.3,                  // Daha az agresif position correction
      0.1,                  // Position correction slop
      0.1,                 // Çok az global friction
      2.0,                  // Velocity threshold
      0.2,                  // Min restitution
      0.8,                  // Max restitution
      0.6,                  // Impulse scale - çarpışmaları yumuşat
      20                   // Max global velocity
    );

    // Sistemleri priority sırasına göre ekle
    this.world.addSystem(new InputSystem());          // Priority: 1
    this.world.addSystem(new PlayerControlSystem());  // Priority: 1
    this.world.addSystem(new MovementSystem());       // Priority: 2
    this.world.addSystem(new PhysicsSystem(physicsConfig)); // Priority: 3 - config ile

    CreateWall(this.world, new Vector2(1920 / 2, 0), 1920, 40)
    CreateWall(this.world, new Vector2(1920 / 2, 1080), 1920, 40)
    CreateWall(this.world, new Vector2(0, 1080 / 2), 40, 1080)
    CreateWall(this.world, new Vector2(1920, 1080 / 2), 40, 1080)

    // Player entity'sini oluştur (merkeze)
    const player = CreatePlayer(this.world);
    const transform = player.getComponent(Transform)!;
    transform.position = new Vector2(300, 400); // Canvas merkezi


    // Hareketli toplar - daha yumuşak başlangıç hızları
    CreateBall(
      this.world,
      new Vector2(300, 150),
    );

    console.log('Game scene initialized with physics config');
  }

  update(deltaTime: number): void {
    // Game logic update
  }

  destroy(): void {
    console.log('Game scene destroyed');
    // Game resources'ları temizle
    this.world.clearEntity();
    this.world.clearSystems();
  }
}
