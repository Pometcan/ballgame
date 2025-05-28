import { Entity } from "./Entity";

export abstract class System {
  abstract componentsRequired: Set<Function>;

  abstract update(entities: Entity[], deltaTime: number): void;

  test(entity: Entity): boolean {
    for (const componentClass of this.componentsRequired) {
      if (!entity.hasComponent(componentClass as any)) {
        return false;
      }
    }
    return true;
  }
}
