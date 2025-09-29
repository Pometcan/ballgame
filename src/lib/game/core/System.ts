import { Entity } from "./Entity";

export abstract class System {
  abstract componentsRequired: Set<Function>;

  abstract update(entities: Entity[], deltaTime: number): void;

  onEntityAdded?(entity: Entity): void;
  onEntityRemoved?(entity: Entity): void;

  priority: number = 0;

  test(entity: Entity): boolean {
    for (const componentClass of this.componentsRequired) {
      if (!entity.hasComponent(componentClass as new (...args: any[]) => any)) {
        return false;
      }
    }
    return true;
  }
}
