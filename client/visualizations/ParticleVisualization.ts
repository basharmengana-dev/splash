import p5 from "p5";
import { IVisualization } from "./IVisualization";

class Particle {
  x: number;
  y: number;
  color: [number, number, number];
  vy: number;
  alpha: number = 255;

  constructor(x: number, y: number, color: [number, number, number]) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.vy = -(3 + Math.random() * 3); // Variable speed: -3 to -6
  }

  update(): void {
    this.y += this.vy; // Move up faster
    this.alpha -= 1.5; // Slower fade = longer lifetime = travel higher
  }

  draw(p: p5): void {
    p.push();
    p.noStroke();
    p.fill(this.color[0], this.color[1], this.color[2], this.alpha);
    p.circle(this.x, this.y, 5);
    p.pop();
  }

  isDead(): boolean {
    return this.alpha <= 0;
  }
}

export class ParticleVisualization implements IVisualization {
  private particles: Particle[] = [];
  private canvasWidth: number = 0;
  private canvasHeight: number = 0;

  setup(p: p5, width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.particles = [];
  }

  update(p: p5): void {
    // Update and remove dead particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.update();

      if (particle.isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(p: p5): void {
    // Semi-transparent background for smooth trail effect
    p.background(0, 0, 0, 50); // Higher alpha = faster fade, no permanent traces

    // Draw all particles
    for (const particle of this.particles) {
      particle.draw(p);
    }
  }

  onTextOutput(text: string): void {
    if (!this.canvasWidth || !this.canvasHeight) {
      return;
    }

    // Simple logic: more text = more particles (at least 1 for any text)
    const count =
      text.length > 0
        ? Math.min(15, Math.max(1, Math.floor(text.length / 2)))
        : 0;

    // Simple logic: pick a color based on text length
    const color = this.pickColor(text.length);

    // Spawn simple particles
    for (let i = 0; i < count; i++) {
      const x = Math.random() * this.canvasWidth;
      const y = this.canvasHeight * (0.9 + Math.random() * 0.1); // 90-100% of height
      this.particles.push(new Particle(x, y, color));
    }
  }

  private pickColor(length: number): [number, number, number] {
    // Vary color by text length using HSL
    const hue = (length * 10) % 360;
    return this.hslToRgb(hue, 70, 60);
  }

  private hslToRgb(h: number, s: number, l: number): [number, number, number] {
    s /= 100;
    l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [
      Math.round(255 * f(0)),
      Math.round(255 * f(8)),
      Math.round(255 * f(4)),
    ];
  }

  clear(): void {
    this.particles = [];
  }

  resize(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  getDebugInfo(): Record<string, any> {
    return {
      particleCount: this.particles.length,
    };
  }
}
