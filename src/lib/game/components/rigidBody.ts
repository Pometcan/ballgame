export class RigidBody {
  constructor(
    public mass: number = 1,
    public friction: number = 0.1,
    public restitution: number = 0.5,
    public isStatic: boolean = false,
    public gravityScale: number = 1
  ) { }
}
