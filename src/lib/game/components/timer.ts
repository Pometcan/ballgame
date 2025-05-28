export class TimerComponent {
  public timers: Map<string, {
    duration: number;
    elapsed: number;
    callback: () => void;
    repeat: boolean;
  }> = new Map();

  addTimer(name: string, duration: number, callback: () => void, repeat: boolean = false): void {
    this.timers.set(name, {
      duration,
      elapsed: 0,
      callback,
      repeat
    });
  }

  removeTimer(name: string): void {
    this.timers.delete(name);
  }
}
