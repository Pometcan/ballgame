import type { Component } from "../core/Component";
import Vector2 from "../util/vector2";

export class Velocity implements Component {
  constructor(
    public velocity: Vector2 = new Vector2(),
    public maxSpeed: number = Infinity
  ) { }
}
