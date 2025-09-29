import type { Component } from "../core/Component";

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

export type ColliderShape = CircleCollider | RectCollider;

export class Collider implements Component {
  constructor(
    public shape: ColliderShape,
    public isTrigger: boolean = false,
    public layer: string = "default"
  ) { }
}
