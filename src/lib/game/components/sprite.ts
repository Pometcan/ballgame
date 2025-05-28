export class Sprite {
  constructor(
    public imagePath: string,
    public width: number,
    public height: number,
    public offsetX: number = 0,
    public offsetY: number = 0,
    public alpha: number = 1
  ) { }
}
