import { Scene } from "../manager/SceneManager";

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
    // Game entity'lerini ve system'leri oluştur
  }

  update(deltaTime: number): void {
    // Game logic update
  }

  render(): void {
    // Game rendering
  }

  destroy(): void {
    console.log('Game scene destroyed');
    // Game resources'ları temizle
    this.world.clearEntity();
    this.world.clearSystems();
  }
}
