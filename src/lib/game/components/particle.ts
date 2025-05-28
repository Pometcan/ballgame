import type Vector2 from "../util/vector2";

export interface Particle {
  location: Vector2;
  velocity: Vector2;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export class ParticleComponent {
  public particles: Particle[] = [];

  constructor(
    public maxParticles: number = 100,
    public emissionRate: number = 10,
    public particleLife: number = 2000
  ) { }
}
