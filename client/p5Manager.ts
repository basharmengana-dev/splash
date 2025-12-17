import p5 from "p5";
import { IVisualization } from "./visualizations/IVisualization";

export class P5Manager {
  private p5Instance: p5 | null = null;
  private currentVisualization: IVisualization | null = null;
  private canvasWidth: number = 0;
  private canvasHeight: number = 0;
  private containerId: string = "";

  /**
   * Set the current visualization
   */
  setVisualization(visualization: IVisualization): void {
    this.currentVisualization = visualization;

    // If P5 is already initialized, setup the new visualization
    if (this.p5Instance && this.canvasWidth && this.canvasHeight) {
      this.currentVisualization.setup(
        this.p5Instance,
        this.canvasWidth,
        this.canvasHeight
      );
    }
  }

  /**
   * Initialize P5.js canvas
   */
  init(containerId: string): void {
    this.containerId = containerId;

    const sketch = (p: p5) => {
      p.setup = () => {
        const container = document.getElementById(containerId);
        if (!container) {
          console.error(`Container ${containerId} not found`);
          return;
        }

        this.canvasWidth = container.clientWidth;
        this.canvasHeight = container.clientHeight;

        const canvas = p.createCanvas(this.canvasWidth, this.canvasHeight);
        canvas.parent(containerId);
        p.background(0, 0); // Transparent background

        // Setup current visualization if set
        if (this.currentVisualization) {
          this.currentVisualization.setup(
            p,
            this.canvasWidth,
            this.canvasHeight
          );
        }
      };

      p.draw = () => {
        if (this.currentVisualization) {
          // Update and draw current visualization
          this.currentVisualization.update(p);
          this.currentVisualization.draw(p);
        } else {
          // No visualization set - just clear
          p.clear();
        }
      };

      p.windowResized = () => {
        const container = document.getElementById(containerId);
        if (container) {
          this.canvasWidth = container.clientWidth;
          this.canvasHeight = container.clientHeight;
          p.resizeCanvas(this.canvasWidth, this.canvasHeight);

          // Notify visualization of resize
          if (this.currentVisualization) {
            this.currentVisualization.resize(
              this.canvasWidth,
              this.canvasHeight
            );
          }
        }
      };
    };

    this.p5Instance = new p5(sketch);
  }

  /**
   * Handle text output from terminal
   */
  onTextOutput(text: string): void {
    if (this.currentVisualization) {
      this.currentVisualization.onTextOutput(text);
    }
  }

  /**
   * Clear the current visualization
   */
  clear(): void {
    if (this.currentVisualization) {
      this.currentVisualization.clear();
    }
    if (this.p5Instance) {
      this.p5Instance.background(0, 0);
    }
  }

  /**
   * Get debug info from current visualization
   */
  getDebugInfo(): Record<string, any> {
    if (this.currentVisualization && this.currentVisualization.getDebugInfo) {
      return this.currentVisualization.getDebugInfo();
    }
    return {};
  }

  /**
   * Clean up P5.js instance
   */
  destroy(): void {
    if (this.p5Instance) {
      this.p5Instance.remove();
      this.p5Instance = null;
    }
    this.currentVisualization = null;
  }
}
