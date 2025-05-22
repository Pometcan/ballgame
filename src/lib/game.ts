
class game {
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

  }

  private setupEventListeners() {
    this.canvas.addEventListener('mousemove', (event) => { });
    this.canvas.addEventListener('mousedown', (event) => { });
    this.canvas.addEventListener('keydown', (event) => { });
    this.canvas.addEventListener('keyup', (event) => { });
    window.addEventListener('resize', () => { });
  }

}
