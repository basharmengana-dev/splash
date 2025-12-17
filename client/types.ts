// Shared types for frontend

export interface ResizeData {
  cols: number;
  rows: number;
}

export interface ExitData {
  exitCode: number;
  signal?: number;
}

export interface TerminalTheme {
  background: string;
  foreground: string;
  cursor: string;
  cursorAccent: string;
  selection: string;
  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  brightBlack: string;
  brightRed: string;
  brightGreen: string;
  brightYellow: string;
  brightBlue: string;
  brightMagenta: string;
  brightCyan: string;
  brightWhite: string;
}

// P5.js Particle System Types
export interface ParticleConfig {
  x: number;
  y: number;
  color: [number, number, number];
  size: number;
  velocity: {
    x: number;
    y: number;
  };
  energy: number;
}

export interface P5ManagerConfig {
  maxParticles: number;
  fadeSpeed: number;
  particleSpeed: number;
}
