import type { Renderable } from "./renderable";

export class Shape implements Renderable {
  zIndex: number = 0;
  visible: boolean = true;
  strokeWidth?: number;
  strokeColor?: string;

  constructor(
    public type: 'rectangle' | 'circle' | 'triangle',
    public width: number,
    public height: number,
    public color: string = '#ffffff',
    options?: {
      strokeWidth?: number,
      strokeColor?: string
    }
  ) {
    if (options) {
      this.strokeWidth = options.strokeWidth;
      this.strokeColor = options.strokeColor;
    }
  }
}
