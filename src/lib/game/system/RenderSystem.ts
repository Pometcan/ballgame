import { System } from '../core/System';
import { Entity } from '../core/Entity';
import { Transform } from '../components/transform';
import { Sprite } from '../components/sprite';
import { Shape } from '../components/shape';
import type { Renderable } from '../components/renderable';

export class RenderSystem extends System {
  componentsRequired = new Set([Transform]);

  private ctx: CanvasRenderingContext2D;
  private imageCache: Map<string, HTMLImageElement> = new Map();

  constructor(canvas: HTMLCanvasElement) {
    super();
    this.ctx = canvas.getContext('2d')!;
    this.priority = 100;
  }

  update(entities: Entity[], deltaTime: number): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    const renderableEntities = entities.filter(entity => {
      const renderable = this.getRenderable(entity);
      return renderable?.visible !== false;
    });

    const sortedEntities = renderableEntities.sort((a, b) => {
      const aRenderable = this.getRenderable(a);
      const bRenderable = this.getRenderable(b);
      const aZ = aRenderable?.zIndex ?? 0;
      const bZ = bRenderable?.zIndex ?? 0;
      return aZ - bZ;
    });

    for (const entity of sortedEntities) {
      this.renderEntity(entity);
    }
  }

  private getRenderable(entity: Entity): Renderable | undefined {
    return entity.getComponent(Sprite) || entity.getComponent(Shape);
  }

  private renderEntity(entity: Entity): void {
    const transform = entity.getComponent(Transform)!;
    const sprite = entity.getComponent(Sprite);
    const shape = entity.getComponent(Shape);

    this.ctx.save();
    this.applyTransform(transform);

    if (sprite) {
      this.renderSprite(sprite);
    } else if (shape) {
      this.renderShape(shape);
    }

    this.ctx.restore();
  }

  private applyTransform(transform: Transform): void {
    this.ctx.translate(transform.position.x, transform.position.y);

    if (transform.rotation !== 0) {
      this.ctx.rotate(transform.rotation);
    }

    if (transform.scale.x !== 1 || transform.scale.y !== 1) {
      this.ctx.scale(transform.scale.x, transform.scale.y);
    }
  }

  private renderSprite(sprite: Sprite): void {
    const image = this.getOrLoadImage(sprite.imageSrc);
    if (!image || !image.complete) {
      this.renderPlaceholder(sprite.width, sprite.height, '#cccccc');
      return;
    }

    this.ctx.drawImage(
      image,
      -sprite.width / 2 + sprite.offsetX,
      -sprite.height / 2 + sprite.offsetY,
      sprite.width,
      sprite.height
    );
  }

  private renderShape(shape: Shape): void {
    this.ctx.fillStyle = shape.color;
    this.ctx.strokeStyle = shape.strokeColor || shape.color;
    this.ctx.lineWidth = shape.strokeWidth || 0;

    switch (shape.type) {
      case 'rectangle':
        this.ctx.fillRect(
          -shape.width / 2,
          -shape.height / 2,
          shape.width,
          shape.height
        );
        if (shape.strokeWidth && shape.strokeWidth > 0) {
          this.ctx.strokeRect(
            -shape.width / 2,
            -shape.height / 2,
            shape.width,
            shape.height
          );
        }
        break;

      case 'circle':
        this.ctx.beginPath();
        this.ctx.arc(0, 0, shape.width / 2, 0, Math.PI * 2);
        this.ctx.fill();
        if (shape.strokeWidth && shape.strokeWidth > 0) {
          this.ctx.stroke();
        }
        break;

      case 'triangle':
        this.ctx.beginPath();
        this.ctx.moveTo(0, -shape.height / 2);
        this.ctx.lineTo(-shape.width / 2, shape.height / 2);
        this.ctx.lineTo(shape.width / 2, shape.height / 2);
        this.ctx.closePath();
        this.ctx.fill();
        if (shape.strokeWidth && shape.strokeWidth > 0) {
          this.ctx.stroke();
        }
        break;
    }
  }

  private renderPlaceholder(width: number, height: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(-width / 2, -height / 2, width, height);

    this.ctx.strokeStyle = '#666666';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(-width / 2, -height / 2);
    this.ctx.lineTo(width / 2, height / 2);
    this.ctx.moveTo(width / 2, -height / 2);
    this.ctx.lineTo(-width / 2, height / 2);
    this.ctx.stroke();
  }

  private getOrLoadImage(src: string): HTMLImageElement | undefined {
    let image = this.imageCache.get(src);

    if (!image) {
      image = new Image();
      image.src = src;
      this.imageCache.set(src, image);

      image.onerror = () => {
        console.warn(`Failed to load image: ${src}`);
      };
    }

    return image;
  }

  renderDebugInfo(entity: Entity): void {
    if (!entity.hasComponent(Transform)) return;

    const transform = entity.getComponent(Transform)!;

    this.ctx.save();
    this.ctx.translate(transform.position.x, transform.position.y);

    this.ctx.fillStyle = '#ff0000';
    this.ctx.fillRect(-2, -2, 4, 4);

    if (transform.rotation !== 0) {
      this.ctx.strokeStyle = '#00ff00';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(20, 0);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  destroy(): void {
    this.imageCache.clear();
  }
}
