export interface AnimationFrame {
  x: number;
  y: number;
  width: number;
  height: number;
  duration: number;
}

export class Animation {
  public currentFrame: number = 0;
  public elapsedTime: number = 0;
  public isPlaying: boolean = true;
  public loop: boolean = true;

  constructor(
    public frames: AnimationFrame[],
    public name: string = "default"
  ) { }
}
