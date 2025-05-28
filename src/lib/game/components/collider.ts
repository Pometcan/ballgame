export type ColliderType = "circle" | "rect" | "polygon";

export interface CircleCollider {
  type: "circle";
  radius: number;
}

export interface RectCollider {
  type: "rect";
  width: number;
  height: number;
}

export interface PolygonCollider {
  type: "polygon";
  vertices: { x: number; y: number }[];
}

export type ColliderShape = CircleCollider | RectCollider | PolygonCollider;

export class Collider {
  constructor(
    public shape: ColliderShape,
    public isTrigger: boolean = false,
    public layer: string = "default"
  ) { }
}
