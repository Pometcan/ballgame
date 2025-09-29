import type { Component } from "./Component";

let nextEntityId = 0;

export type EntityId = number;

export class Entity {
  readonly id: EntityId;
  private components: Map<string, Component>

  constructor() {
    this.id = nextEntityId++;
    this.components = new Map();
  }

  addComponent<T extends Component>(component: T): this {
    const key = this.getComponentKey(component.constructor as new (...args: any[]) => T);
    this.components.set(key, component);
    return this;
  }

  removeComponent<T extends Component>(componentClass: new (...args: any[]) => T): this {
    const key = this.getComponentKey(componentClass);
    this.components.delete(key);
    return this;
  }

  hasComponent<T extends Component>(componentClass: new (...args: any[]) => T): boolean {
    const key = this.getComponentKey(componentClass);
    return this.components.has(key);
  }

  getComponent<T extends Component>(componentClass: new (...args: any[]) => T): T | undefined {
    const key = this.getComponentKey(componentClass);
    return this.components.get(key) as T | undefined;
  }

  getAllComponents(): Component[] {
    return Array.from(this.components.values());
  }

  toJSON() {
    return {
      id: this.id,
      components: Array.from(this.components.values()).map(c => {
        if (typeof (c as any).toJSON === 'function') {
          return (c as any).toJSON();
        }
        return c;
      }),
    };
  }

  private getComponentKey<T>(cls: new (...args: any[]) => T): string {
    return cls.name;
  }

}
