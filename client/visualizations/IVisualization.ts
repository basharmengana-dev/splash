import p5 from "p5";

/**
 * Interface for pluggable visualizations
 * All visualizations must implement this interface to work with P5Manager
 */
export interface IVisualization {
  /**
   * Setup/initialize the visualization
   * @param p - P5.js instance
   * @param width - Canvas width
   * @param height - Canvas height
   */
  setup(p: p5, width: number, height: number): void;

  /**
   * Update visualization state (called every frame)
   * @param p - P5.js instance
   */
  update(p: p5): void;

  /**
   * Draw the visualization (called every frame)
   * @param p - P5.js instance
   */
  draw(p: p5): void;

  /**
   * Handle text output from terminal
   * @param text - Raw text string from terminal
   */
  onTextOutput(text: string): void;

  /**
   * Clear all visual elements
   */
  clear(): void;

  /**
   * Handle canvas resize
   * @param width - New canvas width
   * @param height - New canvas height
   */
  resize(width: number, height: number): void;

  /**
   * Get debug info (optional)
   */
  getDebugInfo?(): Record<string, any>;
}
