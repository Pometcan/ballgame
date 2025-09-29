import { Input } from "../components/Input";
import { Transform } from "../components/transform";
import { Velocity } from "../components/velocity";
import type { Entity } from "../core/Entity";
import { System } from "../core/System";

export class MovementSystem extends System {
  componentsRequired: Set<Function> = new Set([Transform, Velocity, Input])

  constructor() {
    super();
    this.priority = 2;
  }

  update(entities: Entity[], deltaTime: number): void {
    for (const entity of entities) {
      const transform = entity.getComponent(Transform)!;
      const velocity = entity.getComponent(Velocity)!;

      transform.position.x += velocity.velocity.x * deltaTime;
      transform.position.y += velocity.velocity.y * deltaTime;
    }
  }
}
