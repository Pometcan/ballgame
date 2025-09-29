import { RigidBody } from "../components/rigidBody";
import { Transform } from "../components/transform";
import { Velocity } from "../components/velocity";
import { Collider } from "../components/collider";
import { World } from "../core/World";
import type { Entity } from "../core/Entity";
import { Tag, TagType } from "../components/tag";
import { Shape } from "../components/shape";
import Vector2 from "../util/vector2";
import { ParticleComponent } from "../components/particle";

export function CreateBall(world: World, position: Vector2 = new Vector2(0, 0)): Entity {
  const ball = world.createEntity()
    .addComponent(new Transform())
    .addComponent(new Velocity(new Vector2(0, 0), 10))
    .addComponent(new Collider({
      type: "circle",
      radius: 20
    }, false, "ball"))
    .addComponent(new RigidBody(
      1,
      1,
      0.001,
      false,
      0
    ))
    .addComponent(new Tag(TagType.BALL))
    .addComponent(new Shape('circle', 40, 40, '#ffffff'));

  const transform = ball.getComponent(Transform)!;
  transform.position = position;

  return ball;
}

