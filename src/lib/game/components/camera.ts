export class CameraComponent {
  constructor(
    public followTarget: boolean = false,
    public offsetX: number = 0,
    public offsetY: number = 0,
    public smoothing: number = 0.1,
    public bounds?: {
      minX: number;
      maxX: number;
      minY: number;
      maxY: number;
    }
  ) { }
}
