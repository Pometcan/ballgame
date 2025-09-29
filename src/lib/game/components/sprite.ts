import type { Renderable } from "./renderable";

export class Sprite implements Renderable {
  zIndex: number = 0;
  visible: boolean = true;

  constructor(
    public imageSrc: string,
    public width: number = 32,
    public height: number = 32,
    public offsetX: number = 0,
    public offsetY: number = 0
  ) { }
}
