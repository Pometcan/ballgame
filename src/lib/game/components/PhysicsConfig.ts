import type { Component } from "../core/Component";
import Vector2 from "../util/vector2";

export class PhysicsConfig implements Component {
  // Gravity ayarları
  gravity: Vector2;
  gravityScale: number;

  // Collision ayarları
  positionCorrectionPercent: number;
  positionCorrectionSlop: number;

  // Friction ve dampening
  globalFriction: number;
  velocityThreshold: number; // Bu değerin altındaki hızları sıfırlama

  // Restitution limitleri
  minRestitution: number;
  maxRestitution: number;

  // Impulse scaling - çok sert çarpışmaları yumuşatmak için
  impulseScale: number;

  // Max velocity limitleri (güvenlik için)
  maxGlobalVelocity: number;

  constructor(
    gravity: Vector2 = new Vector2(0, 200), // Daha yumuşak gravity
    gravityScale: number = 1,
    positionCorrectionPercent: number = 0.4, // Daha az agresif
    positionCorrectionSlop: number = 0.5,
    globalFriction: number = 0.02, // Daha az friction
    velocityThreshold: number = 1.0, // Daha yüksek threshold
    minRestitution: number = 0.1,
    maxRestitution: number = 0.9,
    impulseScale: number = 0.7, // Çarpışmaları yumuşat
    maxGlobalVelocity: number = 1000
  ) {
    this.gravity = gravity;
    this.gravityScale = gravityScale;
    this.positionCorrectionPercent = positionCorrectionPercent;
    this.positionCorrectionSlop = positionCorrectionSlop;
    this.globalFriction = globalFriction;
    this.velocityThreshold = velocityThreshold;
    this.minRestitution = minRestitution;
    this.maxRestitution = maxRestitution;
    this.impulseScale = impulseScale;
    this.maxGlobalVelocity = maxGlobalVelocity;
  }
}
