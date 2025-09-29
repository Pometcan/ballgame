import { Input } from "../components/Input";
import type { Entity } from "../core/Entity";
import { System } from "../core/System";

export class InputSystem extends System {
  componentsRequired = new Set([Input]);
  private isInitialized = false;

  constructor() {
    super();
    this.priority = 1;
  }

  update(entities: Entity[], deltaTime: number): void {
    if (!this.isInitialized) {
      this.initializeEventListeners(entities);
      this.isInitialized = true;
    }
  }

  private initializeEventListeners(entities: Entity[]): void {
    // Tüm Input component'li entity'ler için event listener ekle
    const inputEntities = entities.filter(entity => entity.hasComponent(Input));

    if (inputEntities.length === 0) return;

    window.addEventListener('keydown', (event) => {
      // Tüm input entity'lerinin keys set'ini güncelle
      inputEntities.forEach(entity => {
        const input = entity.getComponent(Input)!;
        input.keys.add(event.code);
      });
    });

    window.addEventListener('keyup', (event) => {
      // Tüm input entity'lerinin keys set'ini güncelle
      inputEntities.forEach(entity => {
        const input = entity.getComponent(Input)!;
        input.keys.delete(event.code);
      });
    });

    console.log(`InputSystem initialized for ${inputEntities.length} entities`);
  }

  destroy(): void {
    this.isInitialized = false;
    console.log('InputSystem destroyed');
  }
}
