import { Transform } from "../components/transform";
import { Collider } from "../components/collider";
import { RigidBody } from "../components/rigidBody";
import { World } from "../core/World";
import type { Entity } from "../core/Entity";
import { Tag, TagType } from "../components/tag";
import { Shape } from "../components/shape";
import Vector2 from "../util/vector2";

export function CreateWall(
  world: World,
  position: Vector2,
  width: number,
  height: number
): Entity {
  const wall = world.createEntity()
    .addComponent(new Transform())
    .addComponent(new Collider({
      type: 'rect',
      width: width,
      height: height
    }, false, "wall"))
    .addComponent(new RigidBody(
      Infinity,
      0.8,
      0.3,
      true,
      0
    ))
    .addComponent(new Tag(TagType.WALL))
    .addComponent(new Shape('rectangle', width, height, '#8B4513'));

  const transform = wall.getComponent(Transform)!;
  transform.position = position;

  return wall;
}
