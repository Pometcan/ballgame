import { PositionComponent } from "../component/position";
import { ColliderComponent, ColliderShape } from "../component/collider";

type Entity = number; // ID

interface EntityMap {
  [id: number]: {
    position: PositionComponent;
    collider: ColliderComponent;
  };
}

export class CollisionSystem {
  private entities: EntityMap = {};

  addEntity(id: Entity, position: PositionComponent, collider: ColliderComponent) {
    this.entities[id] = { position, collider };
  }

  removeEntity(id: Entity) {
    delete this.entities[id];
  }

  checkCollisions(): [Entity, Entity][] {
    const collisions: [Entity, Entity][] = [];
    const ids = Object.keys(this.entities).map(Number);

    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const idA = ids[i];
        const idB = ids[j];
        const entityA = this.entities[idA];
        const entityB = this.entities[idB];

        if (
          this.isColliding(
            entityA.position,
            entityA.collider.shape,
            entityB.position,
            entityB.collider.shape
          )
        ) {
          collisions.push([idA, idB]);
        }
      }
    }

    return collisions;
  }

  private isColliding(
    posA: PositionComponent,
    shapeA: ColliderShape,
    posB: PositionComponent,
    shapeB: ColliderShape
  ): boolean {
    if (shapeA.type === "circle" && shapeB.type === "circle") {
      return this.circleCircle(posA, shapeA.radius, posB, shapeB.radius);
    }

    if (shapeA.type === "rect" && shapeB.type === "rect") {
      return this.rectRect(posA, shapeA, posB, shapeB);
    }

    if (shapeA.type === "circle" && shapeB.type === "rect") {
      return this.circleRect(posA, shapeA.radius, posB, shapeB);
    }

    if (shapeA.type === "rect" && shapeB.type === "circle") {
      return this.circleRect(posB, shapeB.radius, posA, shapeA);
    }

    return false;
  }

  private circleCircle(
    posA: PositionComponent,
    rA: number,
    posB: PositionComponent,
    rB: number
  ): boolean {
    const dx = posA.x - posB.x;
    const dy = posA.y - posB.y;
    const distSq = dx * dx + dy * dy;
    const rSum = rA + rB;
    return distSq <= rSum * rSum;
  }

  private rectRect(
    posA: PositionComponent,
    rectA: { width: number; height: number },
    posB: PositionComponent,
    rectB: { width: number; height: number }
  ): boolean {
    return (
      posA.x < posB.x + rectB.width &&
      posA.x + rectA.width > posB.x &&
      posA.y < posB.y + rectB.height &&
      posA.y + rectA.height > posB.y
    );
  }

  private circleRect(
    circlePos: PositionComponent,
    radius: number,
    rectPos: PositionComponent,
    rect: { width: number; height: number }
  ): boolean {
    const closestX = Math.max(rectPos.x, Math.min(circlePos.x, rectPos.x + rect.width));
    const closestY = Math.max(rectPos.y, Math.min(circlePos.y, rectPos.y + rect.height));

    const dx = circlePos.x - closestX;
    const dy = circlePos.y - closestY;

    return dx * dx + dy * dy <= radius * radius;
  }
}
