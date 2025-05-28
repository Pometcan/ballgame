export interface IVector2 {
  x: number;
  y: number;
  clone(): Vector2;
  set(x: number, y: number): this;
  add(v: Vector2): this;
  subtract(v: Vector2): this;
  scale(s: number): this;
  dot(v: Vector2): number;
  length(): number;
  normalize(): this;
  distanceTo(v: Vector2): number;
  copyFrom(v: Vector2): this;
  isZero(): boolean;
}

export default class Vector2 implements IVector2 {
  constructor(public x: number = 0, public y: number = 0) { }

  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  set(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }

  add(v: Vector2): this {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  subtract(v: Vector2): this {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  scale(s: number): this {
    this.x *= s;
    this.y *= s;
    return this;
  }

  dot(v: Vector2): number {
    return this.x * v.x + this.y * v.y;
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize(): this {
    const len = this.length();
    if (len > 0) this.scale(1 / len);
    return this;
  }

  distanceTo(v: Vector2): number {
    const dx = v.x - this.x;
    const dy = v.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  copyFrom(v: Vector2): this {
    this.x = v.x;
    this.y = v.y;
    return this;
  }

  isZero(): boolean {
    return this.x === 0 && this.y === 0;
  }
}
