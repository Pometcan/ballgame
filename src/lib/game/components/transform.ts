import type { Component } from "../core/Component";
import Vector2 from "../util/vector2";

export class Transform implements Component {
  position!: Vector2;
  rotation!: number;
  scale!: Vector2;

  constructor(transform?: Transform) {
    if (transform) {
      this.position = transform.position.clone();
      this.rotation = transform.rotation;
      this.scale = transform.scale.clone();
    } else {
      this.position = new Vector2();
      this.rotation = 0;
      this.scale = new Vector2(1, 1);
    }

  }

  setPosition(pos: Vector2) {
    this.position = pos.clone()
  }

  setRotation(rot: number) {
    this.rotation = rot
  }

  setScale(scale: Vector2) {
    this.scale = scale.clone()
  }

}
