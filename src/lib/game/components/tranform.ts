import Vector2 from "../util/vector2";

export class Transform {
  constructor(
    public location: Vector2 = new Vector2(),
    public rotation: number = 0,
    public scale: Vector2 = new Vector2()) { }
}
