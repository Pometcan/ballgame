import { System } from "../core/System";
import type { Entity } from "../core/Entity";
import { Transform } from "../components/transform";
import { Velocity } from "../components/velocity";
import { RigidBody } from "../components/rigidBody";
import { Collider, type ColliderShape } from "../components/collider";
import { PhysicsConfig } from "../components/PhysicsConfig";
import { Tag, TagType } from "../components/tag";
import Vector2 from "../util/vector2";

interface CollisionInfo {
  entityA: Entity;
  entityB: Entity;
  normal: Vector2;
  penetration: number;
  contactPoint: Vector2;
}

export class PhysicsSystem extends System {
  componentsRequired: Set<Function> = new Set([Transform, RigidBody]);
  private config: PhysicsConfig;
  private collisions: CollisionInfo[] = [];

  constructor(config: PhysicsConfig) {
    super();
    this.priority = 3;
    this.config = config;
  }

  update(entities: Entity[], deltaTime: number): void {
    // Fizik güncellemesi adımları
    this.integrateVelocities(entities, deltaTime);
    this.detectCollisions(entities);
    this.resolveCollisions();
    this.integratePositions(entities, deltaTime);
    this.applyConstraints(entities);
  }

  private integrateVelocities(entities: Entity[], deltaTime: number): void {
    for (const entity of entities) {
      const rigidBody = entity.getComponent(RigidBody)!;
      const velocity = entity.getComponent(Velocity);

      if (!velocity || rigidBody.isStatic) continue;

      // Top-down oyun için gravity yok, sadece sürtünme var

      // Global friction uygula (sürtünme ile yavaşlama)
      if (this.config.globalFriction > 0) {
        const frictionForce = velocity.velocity.clone()
          .scale(-this.config.globalFriction);
        velocity.velocity.add(frictionForce.scale(deltaTime));
      }

      // Velocity threshold kontrolü (çok yavaş hareket eden objeleri durdur)
      if (velocity.velocity.length() < this.config.velocityThreshold) {
        velocity.velocity.set(0, 0);
      }

      // Max velocity limiti
      if (velocity.velocity.length() > this.config.maxGlobalVelocity) {
        velocity.velocity = velocity.velocity.normalize()
          .scale(this.config.maxGlobalVelocity);
      }

      // Entity'nin kendi max speed limiti
      if (velocity.maxSpeed !== Infinity &&
        velocity.velocity.length() > velocity.maxSpeed) {
        velocity.velocity = velocity.velocity.normalize()
          .scale(velocity.maxSpeed);
      }
    }
  }

  private detectCollisions(entities: Entity[]): void {
    this.collisions = [];

    const collidableEntities = entities.filter(entity =>
      entity.hasComponent(Collider) && entity.hasComponent(Transform)
    );

    for (let i = 0; i < collidableEntities.length; i++) {
      for (let j = i + 1; j < collidableEntities.length; j++) {
        const entityA = collidableEntities[i];
        const entityB = collidableEntities[j];

        const collisionInfo = this.checkCollision(entityA, entityB);
        if (collisionInfo) {
          this.collisions.push(collisionInfo);
        }
      }
    }
  }

  private checkCollision(entityA: Entity, entityB: Entity): CollisionInfo | null {
    const transformA = entityA.getComponent(Transform)!;
    const transformB = entityB.getComponent(Transform)!;
    const colliderA = entityA.getComponent(Collider)!;
    const colliderB = entityB.getComponent(Collider)!;

    // Trigger collision'lar için sadece detection
    if (colliderA.isTrigger || colliderB.isTrigger) {
      if (this.isColliding(transformA, colliderA.shape, transformB, colliderB.shape)) {
        // Trigger event'i burada handle edilebilir
        return null; // Trigger'lar fiziksel çözümleme gerektirmez
      }
      return null;
    }

    return this.getCollisionInfo(entityA, entityB, transformA, transformB,
      colliderA.shape, colliderB.shape);
  }

  private isColliding(transformA: Transform, shapeA: ColliderShape,
    transformB: Transform, shapeB: ColliderShape): boolean {
    if (shapeA.type === "circle" && shapeB.type === "circle") {
      return this.circleCircleCollision(transformA, shapeA, transformB, shapeB) !== null;
    }

    if (shapeA.type === "circle" && shapeB.type === "rect") {
      return this.circleRectCollision(transformA, shapeA, transformB, shapeB) !== null;
    }

    if (shapeA.type === "rect" && shapeB.type === "circle") {
      return this.circleRectCollision(transformB, shapeB, transformA, shapeA) !== null;
    }

    if (shapeA.type === "rect" && shapeB.type === "rect") {
      return this.rectRectCollision(transformA, shapeA, transformB, shapeB) !== null;
    }

    return false;
  }

  private getCollisionInfo(entityA: Entity, entityB: Entity,
    transformA: Transform, transformB: Transform,
    shapeA: ColliderShape, shapeB: ColliderShape): CollisionInfo | null {
    if (shapeA.type === "circle" && shapeB.type === "circle") {
      return this.circleCircleCollision(transformA, shapeA, transformB, shapeB, entityA, entityB);
    }

    if (shapeA.type === "circle" && shapeB.type === "rect") {
      return this.circleRectCollision(transformA, shapeA, transformB, shapeB, entityA, entityB);
    }

    if (shapeA.type === "rect" && shapeB.type === "circle") {
      const collision = this.circleRectCollision(transformB, shapeB, transformA, shapeA, entityB, entityA);
      if (collision) {
        // Normal'i ters çevir çünkü entity'ler yer değiştirdi
        collision.normal = collision.normal.scale(-1);
        collision.entityA = entityA;
        collision.entityB = entityB;
      }
      return collision;
    }

    if (shapeA.type === "rect" && shapeB.type === "rect") {
      return this.rectRectCollision(transformA, shapeA, transformB, shapeB, entityA, entityB);
    }

    return null;
  }

  private circleCircleCollision(transformA: Transform, shapeA: ColliderShape,
    transformB: Transform, shapeB: ColliderShape,
    entityA?: Entity, entityB?: Entity): CollisionInfo | null {
    if (shapeA.type !== "circle" || shapeB.type !== "circle") return null;

    const distance = transformA.position.distance(transformB.position);
    const radiusSum = shapeA.radius + shapeB.radius;

    if (distance >= radiusSum) return null;

    const penetration = radiusSum - distance;
    const normal = transformB.position.clone().subtract(transformA.position);

    if (normal.length() === 0) {
      normal.set(1, 0); // Fallback normal
    } else {
      normal.normalize();
    }

    const contactPoint = transformA.position.clone()
      .add(normal.clone().scale(shapeA.radius));

    return entityA && entityB ? {
      entityA,
      entityB,
      normal,
      penetration,
      contactPoint
    } : null;
  }

  private circleRectCollision(transformCircle: Transform, shapeCircle: ColliderShape,
    transformRect: Transform, shapeRect: ColliderShape,
    entityA?: Entity, entityB?: Entity): CollisionInfo | null {
    if (shapeCircle.type !== "circle" || shapeRect.type !== "rect") return null;

    const circlePos = transformCircle.position;
    const rectPos = transformRect.position;
    const halfWidth = shapeRect.width / 2;
    const halfHeight = shapeRect.height / 2;

    // Dikdörtgenin köşe noktalarını hesapla
    const left = rectPos.x - halfWidth;
    const right = rectPos.x + halfWidth;
    const top = rectPos.y - halfHeight;
    const bottom = rectPos.y + halfHeight;

    // Çemberin merkezi ile dikdörtgenin en yakın noktasını bul
    const closestX = Math.max(left, Math.min(circlePos.x, right));
    const closestY = Math.max(top, Math.min(circlePos.y, bottom));
    const closestPoint = new Vector2(closestX, closestY);

    const distance = circlePos.distance(closestPoint);

    if (distance >= shapeCircle.radius) return null;

    const penetration = shapeCircle.radius - distance;
    let normal: Vector2;

    if (distance === 0) {
      // Çember dikdörtgenin içinde - en yakın kenarı bul
      const distToLeft = circlePos.x - left;
      const distToRight = right - circlePos.x;
      const distToTop = circlePos.y - top;
      const distToBottom = bottom - circlePos.y;

      const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);

      if (minDist === distToLeft) normal = new Vector2(-1, 0);
      else if (minDist === distToRight) normal = new Vector2(1, 0);
      else if (minDist === distToTop) normal = new Vector2(0, -1);
      else normal = new Vector2(0, 1);
    } else {
      normal = circlePos.clone().subtract(closestPoint).normalize();
    }

    return entityA && entityB ? {
      entityA,
      entityB,
      normal,
      penetration,
      contactPoint: closestPoint
    } : null;
  }

  private rectRectCollision(transformA: Transform, shapeA: ColliderShape,
    transformB: Transform, shapeB: ColliderShape,
    entityA?: Entity, entityB?: Entity): CollisionInfo | null {
    if (shapeA.type !== "rect" || shapeB.type !== "rect") return null;

    const posA = transformA.position;
    const posB = transformB.position;
    const halfWidthA = shapeA.width / 2;
    const halfHeightA = shapeA.height / 2;
    const halfWidthB = shapeB.width / 2;
    const halfHeightB = shapeB.height / 2;

    const leftA = posA.x - halfWidthA;
    const rightA = posA.x + halfWidthA;
    const topA = posA.y - halfHeightA;
    const bottomA = posA.y + halfHeightA;

    const leftB = posB.x - halfWidthB;
    const rightB = posB.x + halfWidthB;
    const topB = posB.y - halfHeightB;
    const bottomB = posB.y + halfHeightB;

    // AABB collision detection
    if (rightA < leftB || leftA > rightB || bottomA < topB || topA > bottomB) {
      return null;
    }

    // Penetration hesapla
    const overlapX = Math.min(rightA, rightB) - Math.max(leftA, leftB);
    const overlapY = Math.min(bottomA, bottomB) - Math.max(topA, topB);

    let normal: Vector2;
    let penetration: number;

    if (overlapX < overlapY) {
      penetration = overlapX;
      normal = posA.x < posB.x ? new Vector2(-1, 0) : new Vector2(1, 0);
    } else {
      penetration = overlapY;
      normal = posA.y < posB.y ? new Vector2(0, -1) : new Vector2(0, 1);
    }

    const contactPoint = new Vector2(
      (Math.max(leftA, leftB) + Math.min(rightA, rightB)) / 2,
      (Math.max(topA, topB) + Math.min(bottomA, bottomB)) / 2
    );

    return entityA && entityB ? {
      entityA,
      entityB,
      normal,
      penetration,
      contactPoint
    } : null;
  }

  private resolveCollisions(): void {
    for (const collision of this.collisions) {
      this.resolveCollision(collision);
    }
  }

  private resolveCollision(collision: CollisionInfo): void {
    const { entityA, entityB, normal, penetration } = collision;

    const rigidBodyA = entityA.getComponent(RigidBody)!;
    const rigidBodyB = entityB.getComponent(RigidBody)!;
    const velocityA = entityA.getComponent(Velocity);
    const velocityB = entityB.getComponent(Velocity);

    // Tag'leri kontrol et
    const tagA = entityA.getComponent(Tag);
    const tagB = entityB.getComponent(Tag);

    // Player-Wall collision'ında sadece player'ı durdur, sekmesin
    const isPlayerWallCollision = (
      (tagA?.type === TagType.PLAYER && tagB?.type === TagType.WALL) ||
      (tagA?.type === TagType.WALL && tagB?.type === TagType.PLAYER)
    );

    // Static body'ler hareket etmez
    if (rigidBodyA.isStatic && rigidBodyB.isStatic) return;

    // Position correction - penetration'ı düzelt
    this.correctPositions(collision);

    // Velocity resolution
    if (velocityA || velocityB) {
      if (isPlayerWallCollision) {
        // Player-wall collision: player'ı durdur, sekmesin
        this.resolvePlayerWallCollision(collision, velocityA, velocityB, tagA, tagB);
      } else {
        // Normal collision: bounce effects
        this.resolveVelocities(collision, velocityA, velocityB, rigidBodyA, rigidBodyB);
      }
    }
  }

  private correctPositions(collision: CollisionInfo): void {
    const { entityA, entityB, normal, penetration } = collision;

    const rigidBodyA = entityA.getComponent(RigidBody)!;
    const rigidBodyB = entityB.getComponent(RigidBody)!;
    const transformA = entityA.getComponent(Transform)!;
    const transformB = entityB.getComponent(Transform)!;

    // Penetration'ı tamamen düzelt (slop kullanma)
    if (penetration <= 0.001) return; // Çok küçük penetration'ları ignore et

    const totalMass = rigidBodyA.isStatic ? rigidBodyB.mass :
      rigidBodyB.isStatic ? rigidBodyA.mass :
        rigidBodyA.mass + rigidBodyB.mass;

    // Tam penetration düzeltmesi
    const correctionMagnitude = penetration / totalMass;
    const correction = normal.clone().scale(correctionMagnitude);

    if (!rigidBodyA.isStatic) {
      const massRatioA = rigidBodyB.isStatic ? 1 : rigidBodyA.mass / totalMass;
      transformA.position.subtract(correction.clone().scale(massRatioA));
    }

    if (!rigidBodyB.isStatic) {
      const massRatioB = rigidBodyA.isStatic ? 1 : rigidBodyB.mass / totalMass;
      transformB.position.add(correction.clone().scale(massRatioB));
    }
  }

  private resolveVelocities(collision: CollisionInfo, velocityA: Velocity | undefined,
    velocityB: Velocity | undefined, rigidBodyA: RigidBody,
    rigidBodyB: RigidBody): void {
    const { normal } = collision;

    const velA = velocityA ? velocityA.velocity : new Vector2(0, 0);
    const velB = velocityB ? velocityB.velocity : new Vector2(0, 0);

    // Relative velocity
    const relativeVelocity = velB.clone().subtract(velA);
    const velocityAlongNormal = relativeVelocity.dot(normal);

    // Ayrılıyorlarsa collision resolution yapmaya gerek yok
    if (velocityAlongNormal > 0) return;

    // Restitution hesapla - daha yüksek bounce için
    const restitution = Math.max(rigidBodyA.restitution, rigidBodyB.restitution);

    // Impulse hesapla
    let impulseScalar = -(1 + restitution) * velocityAlongNormal;

    const totalMass = rigidBodyA.isStatic ? rigidBodyB.mass :
      rigidBodyB.isStatic ? rigidBodyA.mass :
        rigidBodyA.mass + rigidBodyB.mass;

    impulseScalar /= totalMass;

    const impulse = normal.clone().scale(impulseScalar);

    // Velocity'leri güncelle
    if (velocityA && !rigidBodyA.isStatic) {
      const massRatioA = rigidBodyB.isStatic ? 1 : rigidBodyA.mass / totalMass;
      velocityA.velocity.subtract(impulse.clone().scale(massRatioA));
    }

    if (velocityB && !rigidBodyB.isStatic) {
      const massRatioB = rigidBodyA.isStatic ? 1 : rigidBodyB.mass / totalMass;
      velocityB.velocity.add(impulse.clone().scale(massRatioB));
    }

    // Friction uygula - daha az friction
    this.applyFriction(collision, velocityA, velocityB, rigidBodyA, rigidBodyB, impulseScalar);
  }

  private applyFriction(collision: CollisionInfo, velocityA: Velocity | undefined,
    velocityB: Velocity | undefined, rigidBodyA: RigidBody,
    rigidBodyB: RigidBody, normalImpulse: number): void {
    const { normal } = collision;

    const velA = velocityA ? velocityA.velocity : new Vector2(0, 0);
    const velB = velocityB ? velocityB.velocity : new Vector2(0, 0);

    const relativeVelocity = velB.clone().subtract(velA);
    const tangent = relativeVelocity.clone().subtract(
      normal.clone().scale(relativeVelocity.dot(normal))
    );

    if (tangent.length() < 0.01) return; // Çok küçük tangent velocity'leri ignore et

    tangent.normalize();

    // Friction coefficient - daha az friction
    const friction = Math.sqrt(rigidBodyA.friction * rigidBodyB.friction) * 0.5; // Friction'ı azalt

    const totalMass = rigidBodyA.isStatic ? rigidBodyB.mass :
      rigidBodyB.isStatic ? rigidBodyA.mass :
        rigidBodyA.mass + rigidBodyB.mass;

    let frictionImpulse = -relativeVelocity.dot(tangent) / totalMass;

    // Coulomb friction
    if (Math.abs(frictionImpulse) < Math.abs(normalImpulse) * friction) {
      // Static friction
      const frictionVector = tangent.clone().scale(frictionImpulse);

      if (velocityA && !rigidBodyA.isStatic) {
        const massRatioA = rigidBodyB.isStatic ? 1 : rigidBodyA.mass / totalMass;
        velocityA.velocity.subtract(frictionVector.clone().scale(massRatioA));
      }

      if (velocityB && !rigidBodyB.isStatic) {
        const massRatioB = rigidBodyA.isStatic ? 1 : rigidBodyB.mass / totalMass;
        velocityB.velocity.add(frictionVector.clone().scale(massRatioB));
      }
    } else {
      // Kinetic friction
      frictionImpulse = Math.abs(normalImpulse) * friction;
      const frictionVector = tangent.clone().scale(-frictionImpulse);

      if (velocityA && !rigidBodyA.isStatic) {
        const massRatioA = rigidBodyB.isStatic ? 1 : rigidBodyA.mass / totalMass;
        velocityA.velocity.subtract(frictionVector.clone().scale(massRatioA));
      }

      if (velocityB && !rigidBodyB.isStatic) {
        const massRatioB = rigidBodyA.isStatic ? 1 : rigidBodyB.mass / totalMass;
        velocityB.velocity.add(frictionVector.clone().scale(massRatioB));
      }
    }
  }

  private integratePositions(entities: Entity[], deltaTime: number): void {
    for (const entity of entities) {
      const transform = entity.getComponent(Transform)!;
      const velocity = entity.getComponent(Velocity);
      const rigidBody = entity.getComponent(RigidBody)!;

      if (!velocity || rigidBody.isStatic) continue;

      // Position'ı velocity ile güncelle
      transform.position.add(velocity.velocity.clone().scale(deltaTime));
    }
  }

  private resolvePlayerWallCollision(collision: CollisionInfo, velocityA: Velocity | undefined,
    velocityB: Velocity | undefined, tagA: Tag | undefined, tagB: Tag | undefined): void {
    const { normal } = collision;

    // Player'ı belirle
    let playerVelocity: Velocity | undefined;
    if (tagA?.type === TagType.PLAYER) {
      playerVelocity = velocityA;
    } else if (tagB?.type === TagType.PLAYER) {
      playerVelocity = velocityB;
    }

    if (!playerVelocity) return;

    // Player'ın velocity'sini normal yönünde sıfırla (duvara doğru gitmesin)
    const velocityAlongNormal = playerVelocity.velocity.dot(normal);

    if (velocityAlongNormal < 0) {
      // Player duvara doğru hareket ediyorsa, o yöndeki velocity'yi sıfırla
      const normalVelocity = normal.clone().scale(velocityAlongNormal);
      playerVelocity.velocity.subtract(normalVelocity);
    }
  }

  private applyConstraints(entities: Entity[]): void {
    // Burada world boundaries vb. uygulanabilir
    // Şimdilik boş
  }
}
