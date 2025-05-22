type Entity = number;
type ComponentClass<T> = new (...args: any[]) => T;
export class EntityManager {
  private nextId: Entity = 1;
  private entities: Set<Entity> = new Set();
  private components: Map<ComponentClass<any>, Map<Entity, any>> = new Map();

  createEntity(): Entity {
    const id = this.nextId++;
    this.entities.add(id);
    return id;
  }

  removeEntity(entity: Entity): void {
    this.entities.delete(entity);
    for (const componentMap of this.components.values()) {
      componentMap.delete(entity);
    }
  }

  addComponent<T extends object>(entity: Entity, component: T): void {
    const componentClass = component.constructor as ComponentClass<T>;
    if (!this.components.has(componentClass)) {
      this.components.set(componentClass, new Map());
    }
    this.components.get(componentClass)!.set(entity, component);
  }

  getComponent<T>(entity: Entity, componentClass: ComponentClass<T>): T | undefined {
    return this.components.get(componentClass)?.get(entity);
  }

  hasComponent<T>(entity: Entity, componentClass: ComponentClass<T>): boolean {
    return this.components.get(componentClass)?.has(entity) ?? false;
  }

  removeComponent<T>(entity: Entity, componentClass: ComponentClass<T>): void {
    this.components.get(componentClass)?.delete(entity);
  }

  queryEntities<T extends any[]>(...componentClasses: { [K in keyof T]: ComponentClass<T[K]> }): Entity[] {
    if (componentClasses.length === 0) return [];

    const [first, ...rest] = componentClasses;
    const firstMap = this.components.get(first);
    if (!firstMap) return [];

    const result: Entity[] = [];
    for (const entity of firstMap.keys()) {
      if (rest.every(cls => this.components.get(cls)?.has(entity))) {
        result.push(entity);
      }
    }

    return result;
  }
}
