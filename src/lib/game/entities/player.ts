import { RigidBody } from "../components/rigidBody";
import { Transform } from "../components/transform"
import { Velocity } from "../components/velocity";
import { Collider } from "../components/collider";
import { World } from "../core/World";
import type { Entity } from "../core/Entity";
import { Tag, TagType } from "../components/tag";
import { Shape } from "../components/shape";
import Vector2 from "../util/vector2";
import { Input } from "../components/Input";
import { PlayerStats } from "../components/playerStats";

export function CreatePlayer(world: World): Entity {
  const player = world.createEntity()
    .addComponent(new Transform())
    .addComponent(new Velocity(new Vector2(0, 0), 400))
    .addComponent(new Collider({
      type: "circle",
      radius: 60
    }, false, "player"))
    .addComponent(new RigidBody(
      2.0, 0.3, 0.5,
      false,
      0
    ))
    .addComponent(new Tag(TagType.PLAYER))
    .addComponent(new Shape('circle', 120, 120, '#20aaff'))
    .addComponent(new Input())
    .addComponent(new PlayerStats())

  return player;
}
