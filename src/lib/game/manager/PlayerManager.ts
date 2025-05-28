import { Entity } from "../core/Entity";
import { World } from "../core/World";
import { Transform } from "../components/tranform";
import { Velocity } from "../components/velocity";
import { Sprite } from "../components/sprite";
import { Collider } from "../components/collider";
import { RigidBody } from "../components/rigidBody";
import { AudioComponent } from "../components/audio";
import Vector2 from "../util/vector2";
import { globalEventManager, EventTypes } from "./EventManager";

export interface PlayerConfig {
  startPosition: Vector2;
  speed: number;
  size: number;
  spritePath?: string;
  soundFiles?: { [key: string]: string };
}

export class PlayerManager {
  private world: World;
  private players: Map<string, Entity> = new Map();
  private inputState: Map<string, boolean> = new Map();
  private specialAbilityActive: Map<string, boolean> = new Map();

  constructor(world: World) {
    this.world = world;
    this.setupInputHandlers();
  }

  createPlayer(playerId: string, config: PlayerConfig): Entity {
    const player = this.world.createEntity();

    player.addComponent(new Transform(
      config.startPosition.clone(),
      0,
      new Vector2(1, 1)
    ));

    player.addComponent(new Velocity(
      new Vector2(0, 0),
      config.speed
    ));

    // Circle Collider
    player.addComponent(new Collider({
      type: "circle",
      radius: config.size / 2
    }, false, "player"));

    // Rigid Body
    player.addComponent(new RigidBody(
      1,     // mass
      0.8,   // friction
      0.3,   // restitution
      false, // isStatic
      1      // gravityScale
    ));

    this.players.set(playerId, player);
    this.specialAbilityActive.set(playerId, false);

    globalEventManager.emit(EventTypes.ENTITY_CREATED, {
      entityId: player.id,
      playerId: playerId
    });

    return player;
  }

  removePlayer(playerId: string): void {
    const player = this.players.get(playerId);
    if (player) {
      this.world.removeEntity(player);
      this.players.delete(playerId);
      this.specialAbilityActive.delete(playerId);

      globalEventManager.emit(EventTypes.ENTITY_DESTROYED, {
        entityId: player.id,
        playerId: playerId
      });
    }
  }

  getPlayer(playerId: string): Entity | undefined {
    return this.players.get(playerId);
  }

  getAllPlayers(): Entity[] {
    return Array.from(this.players.values());
  }

  private setupInputHandlers(): void {
    // Keyboard event listeners
    document.addEventListener('keydown', (event) => {
      this.inputState.set(event.code.toLowerCase(), true);
      this.handleKeyDown(event.code.toLowerCase());
    });

    document.addEventListener('keyup', (event) => {
      this.inputState.set(event.code.toLowerCase(), false);
      this.handleKeyUp(event.code.toLowerCase());
    });
  }

  private handleKeyDown(keyCode: string): void {
    // Space tuşu için özel yetenek
    if (keyCode === 'space') {
      this.activateSpecialAbility();
    }

    // Input event emit et
    globalEventManager.emit(EventTypes.KEY_DOWN, {
      key: keyCode
    });
  }

  private handleKeyUp(keyCode: string): void {
    // Space tuşu bırakıldığında özel yeteneği devre dışı bırak
    if (keyCode === 'space') {
      this.deactivateSpecialAbility();
    }

    // Input event emit et
    globalEventManager.emit(EventTypes.KEY_UP, {
      key: keyCode
    });
  }

  private activateSpecialAbility(): void {
    this.players.forEach((player, playerId) => {
      if (!this.specialAbilityActive.get(playerId)) {
        this.specialAbilityActive.set(playerId, true);

        // Mevcut collider'ı al
        const collider = player.getComponent(Collider);
        if (collider && collider.shape.type === "circle") {
          // Yeni büyük collider oluştur
          const originalRadius = collider.shape.radius;
          const newCollider = new Collider({
            type: "circle",
            radius: originalRadius * 2.5 // 2.5 kat büyük
          }, false, "player_special");

          // Collider'ı değiştir
          player.removeComponent(Collider);
          player.addComponent(newCollider);

          // Ses çal (eğer varsa)
          const audio = player.getComponent(AudioComponent);
          if (audio) {
            audio.play('special_ability', 0.7);
          }

          console.log(`Player ${playerId} special ability activated!`);
        }
      }
    });
  }

  private deactivateSpecialAbility(): void {
    this.players.forEach((player, playerId) => {
      if (this.specialAbilityActive.get(playerId)) {
        this.specialAbilityActive.set(playerId, false);

        // Collider'ı orijinal boyutuna döndür
        const collider = player.getComponent(Collider);
        if (collider && collider.shape.type === "circle") {
          const originalRadius = collider.shape.radius / 2.5; // Orijinal boyut
          const originalCollider = new Collider({
            type: "circle",
            radius: originalRadius
          }, false, "player");

          // Collider'ı değiştir
          player.removeComponent(Collider);
          player.addComponent(originalCollider);

          console.log(`Player ${playerId} special ability deactivated!`);
        }
      }
    });
  }

  update(deltaTime: number): void {
    this.players.forEach((player, playerId) => {
      this.updatePlayerMovement(player, deltaTime);
    });
  }

  private updatePlayerMovement(player: Entity, deltaTime: number): void {
    const velocity = player.getComponent(Velocity);
    if (!velocity) return;

    const speed = velocity.maxSpeed;
    let moveX = 0;
    let moveY = 0;

    // WASD hareketi
    if (this.inputState.get('keyw') || this.inputState.get('arrowup')) {
      moveY = -speed;
    }
    if (this.inputState.get('keys') || this.inputState.get('arrowdown')) {
      moveY = speed;
    }
    if (this.inputState.get('keya') || this.inputState.get('arrowleft')) {
      moveX = -speed;
    }
    if (this.inputState.get('keyd') || this.inputState.get('arrowright')) {
      moveX = speed;
    }

    // Çapraz hareket için normalizasyon
    if (moveX !== 0 && moveY !== 0) {
      const length = Math.sqrt(moveX * moveX + moveY * moveY);
      moveX = (moveX / length) * speed;
      moveY = (moveY / length) * speed;
    }

    // Velocity'yi güncelle
    velocity.velocity.x = moveX;
    velocity.velocity.y = moveY;
  }

  // Utility methodlar
  isPlayerAlive(playerId: string): boolean {
    return this.players.has(playerId);
  }

  getPlayerPosition(playerId: string): Vector2 | null {
    const player = this.players.get(playerId);
    if (player) {
      const transform = player.getComponent(Transform);
      return transform ? transform.location.clone() : null;
    }
    return null;
  }

  teleportPlayer(playerId: string, position: Vector2): void {
    const player = this.players.get(playerId);
    if (player) {
      const transform = player.getComponent(Transform);
      if (transform) {
        transform.location = position.clone();
      }
    }
  }

  // Cleanup
  destroy(): void {
    this.players.clear();
    this.inputState.clear();
    this.specialAbilityActive.clear();

    // Event listener'ları temizle
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
  }
}
