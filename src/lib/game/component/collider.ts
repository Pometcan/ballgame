export type ColliderType = "circle" | "rect";

export interface CircleCollider {
  type: "circle";
  radius: number;
}

export interface RectCollider {
  type: "rect";
  width: number;
  height: number;
}

export type ColliderShape = CircleCollider | RectCollider;

export class ColliderComponent {
  constructor(public shape: ColliderShape) { }
}
