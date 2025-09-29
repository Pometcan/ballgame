import { Entity } from "./Entity";
import { System } from "./System";
import { TagType, Tag } from "../components/tag";
import type { Component } from "./Component";


export class World {
  private entities: Entity[] = [];
  private systems: System[] = [];
  private lastEntityId: number = 0;

  createEntity(): Entity {
    const entity = new Entity();
    this.lastEntityId++;
    this.entities.push(entity);
    return entity
  }

  removeEntity(entity: Entity): void {
    this.entities = this.entities.filter(e => e !== entity);
  }

  clearEntity(): void {
    this.entities = [];
  }

  addSystem(system: System): void {
    this.systems.push(system);
  }

  removeSystem(system: System): void {
    this.systems = this.systems.filter(e => e !== system);
  }

  clearSystems(): void {
    this.systems = [];
  }

  update(deltaTime: number): void {
    for (const system of this.systems) {
      const relevantEntities = this.entities.filter(entity => system.test(entity))
      system.update(relevantEntities, deltaTime);
    }
  }

  getEntities(): Entity[] {
    return this.entities;
  }

  getEntitiesWithTag(tagType: TagType): Entity[] {
    return this.entities.filter(entity => {
      const tagComponent = entity.getComponent(Tag);
      return tagComponent && tagComponent.type === tagType;
    });
  }
}
