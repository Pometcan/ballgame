import { World } from "../../core/World";
import { PlayerManager } from "../../manager/PlayerManager";
import Vector2 from "../../util/vector2";

export function ExamplePlayer() {
  const world = new World();

  const playerManager = new PlayerManager(world);

  const playerConfig = {
    startPosition: new Vector2(400, 300),
    speed: 200,
    size: 40,
  };

  const player = playerManager.createPlayer("player1", playerConfig);

  console.log("Player created with ID:", player.id);
  console.log("Player components:", player.getAllComponents());

  function gameLoop(deltaTime: number) {
    playerManager.update(deltaTime);
    world.update(deltaTime);
  }

  return {
    world,
    playerManager,
    player,
    gameLoop
  };
}
