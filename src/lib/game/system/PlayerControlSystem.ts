import { Input } from "../components/Input";
import { Velocity } from "../components/velocity";
import { PlayerStats } from "../components/playerStats";
import type { Entity } from "../core/Entity";
import { System } from "../core/System";
import Vector2 from "../util/vector2";

export class PlayerControlSystem extends System {
  componentsRequired: Set<Function> = new Set([Input, Velocity]);

  constructor() {
    super();
    this.priority = 1; // InputSystem'den sonra, MovementSystem'den önce çalışsın
  }

  update(entities: Entity[], deltaTime: number): void {
    for (const entity of entities) {
      const input = entity.getComponent(Input)!;
      const velocity = entity.getComponent(Velocity)!;

      // PlayerStats varsa hızını al, yoksa default değer kullan
      const playerStats = entity.getComponent(PlayerStats);
      const speed = playerStats ? playerStats.speed : 200;

      // Hareket vektörünü hesapla
      let moveX = 0;
      let moveY = 0;

      // Yatay hareket (A/D veya ArrowLeft/ArrowRight)
      if (input.isPressed('KeyA') || input.isPressed('ArrowLeft')) {
        moveX -= 1;
      }
      if (input.isPressed('KeyD') || input.isPressed('ArrowRight')) {
        moveX += 1;
      }

      // Dikey hareket (W/S veya ArrowUp/ArrowDown)
      if (input.isPressed('KeyW') || input.isPressed('ArrowUp')) {
        moveY -= 1;
      }
      if (input.isPressed('KeyS') || input.isPressed('ArrowDown')) {
        moveY += 1;
      }

      // Diagonal hareket için normalize et
      if (moveX !== 0 || moveY !== 0) {
        const moveVector = new Vector2(moveX, moveY).normalize();
        velocity.velocity.x = moveVector.x * speed;
        velocity.velocity.y = moveVector.y * speed;
      } else {
        // Hareket yoksa durdur
        velocity.velocity.x = 0;
        velocity.velocity.y = 0;
      }
    }
  }
}
