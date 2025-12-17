import { io, Socket } from "socket.io-client";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { WebLinksAddon } from "xterm-addon-web-links";
import { ResizeData, ExitData, TerminalTheme } from "./types";
import { P5Manager } from "./p5Manager";
import { ParticleVisualization } from "./visualizations/ParticleVisualization";

// Initialize Socket.io connection
const socket: Socket = io();

// Initialize P5.js manager for generative art
const p5Manager = new P5Manager();

// Create and set particle visualization
const particleViz = new ParticleVisualization();
p5Manager.setVisualization(particleViz);

// Define terminal theme
const terminalTheme: TerminalTheme = {
  background: "#000000",
  foreground: "#f0f0f0",
  cursor: "#4a9eff",
  cursorAccent: "#000000",
  selection: "rgba(74, 158, 255, 0.3)",
  black: "#000000",
  red: "#ef4444",
  green: "#4ade80",
  yellow: "#facc15",
  blue: "#4a9eff",
  magenta: "#e879f9",
  cyan: "#22d3ee",
  white: "#e5e7eb",
  brightBlack: "#6b7280",
  brightRed: "#f87171",
  brightGreen: "#86efac",
  brightYellow: "#fde047",
  brightBlue: "#6bb0ff",
  brightMagenta: "#f0abfc",
  brightCyan: "#67e8f9",
  brightWhite: "#f9fafb",
};

// Initialize xterm.js terminal
const term = new Terminal({
  cursorBlink: true,
  cursorStyle: "block",
  fontFamily:
    '"Cascadia Code", "Fira Code", "Monaco", "Menlo", "Ubuntu Mono", "Consolas", monospace',
  fontSize: 14,
  lineHeight: 1.2,
  theme: terminalTheme,
  allowProposedApi: true,
});

// Load addons
const fitAddon = new FitAddon();
const webLinksAddon = new WebLinksAddon();

term.loadAddon(fitAddon);
term.loadAddon(webLinksAddon);

// Open terminal in the container
const terminalContainer = document.getElementById("terminal-container");
if (terminalContainer) {
  term.open(terminalContainer);
}

// Fit terminal to container
fitAddon.fit();

// Initialize P5.js canvas for generative art
// Wait a bit for DOM to be ready
setTimeout(() => {
  p5Manager.init("p5-canvas");
}, 100);

// Get status indicators
const statusIndicator = document.getElementById("status-indicator");
const statusText = document.getElementById("status-text");
const dimensionsElement = document.getElementById("dimensions");

// Update status indicators
function updateStatus(connected: boolean): void {
  if (statusIndicator && statusText) {
    if (connected) {
      statusIndicator.classList.remove("disconnected");
      statusIndicator.classList.add("connected");
      statusText.textContent = "Connected";
    } else {
      statusIndicator.classList.remove("connected");
      statusIndicator.classList.add("disconnected");
      statusText.textContent = "Disconnected";
    }
  }
}

// Update terminal dimensions display
function updateDimensions(): void {
  if (dimensionsElement) {
    dimensionsElement.textContent = `${term.cols}×${term.rows}`;
  }
}

// Socket.io event handlers
socket.on("connect", () => {
  console.log("Connected to server");
  updateStatus(true);

  // Send initial terminal size
  const resizeData: ResizeData = {
    cols: term.cols,
    rows: term.rows,
  };
  socket.emit("resize", resizeData);

  updateDimensions();
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
  updateStatus(false);
  term.write("\r\n\x1b[1;31m[Disconnected from server]\x1b[0m\r\n");
});

socket.on("connect_error", (error: Error) => {
  console.error("Connection error:", error);
  updateStatus(false);
});

// Handle terminal output from server
socket.on("output", (data: string) => {
  term.write(data);

  // Pass text directly to visualization
  // Filter out ANSI escape sequences
  const cleanData = data.replace(/\x1b\[[0-9;]*m/g, "");

  // Only generate visuals for substantial output (more than whitespace)
  if (cleanData.trim().length > 0) {
    p5Manager.onTextOutput(cleanData);
  }
});

// Handle terminal exit
socket.on("exit", ({ exitCode, signal }: ExitData) => {
  console.log(`Terminal exited with code ${exitCode}, signal ${signal}`);
  term.write(`\r\n\x1b[1;33m[Process exited with code ${exitCode}]\x1b[0m\r\n`);
  updateStatus(false);
});

// Send terminal input to server
term.onData((data: string) => {
  socket.emit("input", data);

  // Generate particles for user input too!
  p5Manager.onTextOutput(data);
});

// Handle terminal resize
let resizeTimeout: ReturnType<typeof setTimeout>;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    fitAddon.fit();
    const resizeData: ResizeData = {
      cols: term.cols,
      rows: term.rows,
    };
    socket.emit("resize", resizeData);
    updateDimensions();
  }, 100);
});

// Handle window focus
window.addEventListener("focus", () => {
  term.focus();
});

// Initial focus
term.focus();

// Display welcome message
setTimeout(() => {
  if (socket.connected) {
    console.log("Terminal ready");
  }
}, 100);

// Handle visibility change
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && socket.connected) {
    term.focus();
  }
});

// Prevent context menu on terminal
if (terminalContainer) {
  terminalContainer.addEventListener("contextmenu", (e: Event) => {
    e.preventDefault();
  });
}

// Log terminal info
console.log("Terminal initialized:", {
  cols: term.cols,
  rows: term.rows,
  connected: socket.connected,
});
