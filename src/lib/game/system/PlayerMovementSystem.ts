import { System } from "../core/System";
import { Entity } from "../core/Entity";
import { Transform } from "../components/tranform";
import { Velocity } from "../components/velocity";
import { RigidBody } from "../components/rigidBody";

export class PlayerMovementSystem extends System {
  componentsRequired = new Set<Function>([
    Transform,
    Velocity
  ]);

  update(entities: Entity[], deltaTime: number): void {
    for (const entity of entities) {
      this.updateEntityMovement(entity, deltaTime);
    }
  }

  private updateEntityMovement(entity: Entity, deltaTime: number): void {
    const transform = entity.getComponent(Transform)!;
    const velocity = entity.getComponent(Velocity)!;
    const rigidBody = entity.getComponent(RigidBody);

    // Eğer RigidBody varsa ve static ise hareket etme
    if (rigidBody && rigidBody.isStatic) {
      return;
    }

    // Pozisyonu güncelle
    const deltaTimeInSeconds = deltaTime / 1000;

    transform.location.x += velocity.velocity.x * deltaTimeInSeconds;
    transform.location.y += velocity.velocity.y * deltaTimeInSeconds;

    // Friction uygula (eğer RigidBody varsa)
    if (rigidBody && rigidBody.friction > 0) {
      const frictionForce = rigidBody.friction * deltaTimeInSeconds;

      // X ekseni için friction
      if (velocity.velocity.x > 0) {
        velocity.velocity.x = Math.max(0, velocity.velocity.x - frictionForce * velocity.maxSpeed);
      } else if (velocity.velocity.x < 0) {
        velocity.velocity.x = Math.min(0, velocity.velocity.x + frictionForce * velocity.maxSpeed);
      }

      // Y ekseni için friction
      if (velocity.velocity.y > 0) {
        velocity.velocity.y = Math.max(0, velocity.velocity.y - frictionForce * velocity.maxSpeed);
      } else if (velocity.velocity.y < 0) {
        velocity.velocity.y = Math.min(0, velocity.velocity.y + frictionForce * velocity.maxSpeed);
      }
    }

    // Max speed kontrolü
    const currentSpeed = Math.sqrt(
      velocity.velocity.x * velocity.velocity.x +
      velocity.velocity.y * velocity.velocity.y
    );

    if (currentSpeed > velocity.maxSpeed) {
      const scale = velocity.maxSpeed / currentSpeed;
      velocity.velocity.x *= scale;
      velocity.velocity.y *= scale;
    }
  }
}
