export class AudioComponent {
  public sounds: Map<string, HTMLAudioElement> = new Map();

  constructor(public soundFiles: { [key: string]: string }) {
    Object.entries(soundFiles).forEach(([name, path]) => {
      const audio = new Audio(path);
      this.sounds.set(name, audio);
    });
  }

  play(soundName: string, volume: number = 1): void {
    const sound = this.sounds.get(soundName);
    if (sound) {
      sound.volume = volume;
      sound.currentTime = 0;
      sound.play();
    }
  }
}
