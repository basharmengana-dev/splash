import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import * as pty from "node-pty";
import os from "os";
import path from "path";

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server);

const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "..", "public")));

// Determine which shell to use
const shell: string =
  os.platform() === "win32"
    ? "powershell.exe"
    : process.env.SHELL || "/bin/bash";

console.log(`Using shell: ${shell}`);

// Define Socket.io event interfaces
interface ResizeData {
  cols: number;
  rows: number;
}

interface ExitData {
  exitCode: number;
  signal?: number;
}

// Handle socket connections
io.on("connection", (socket: Socket) => {
  console.log("Client connected:", socket.id);

  // Spawn a pseudo-terminal process
  const ptyProcess = pty.spawn(shell, [], {
    name: "xterm-color",
    cols: 80,
    rows: 24,
    cwd: process.env.HOME || process.env.USERPROFILE || os.homedir(),
    env: process.env as { [key: string]: string },
  });

  console.log(`Spawned PTY process with PID: ${ptyProcess.pid}`);

  // Forward PTY output to client
  ptyProcess.onData((data: string) => {
    socket.emit("output", data);
  });

  // Handle PTY exit
  ptyProcess.onExit(
    ({ exitCode, signal }: { exitCode: number; signal?: number }) => {
      console.log(`PTY process exited with code ${exitCode}, signal ${signal}`);
      const exitData: ExitData = { exitCode, signal };
      socket.emit("exit", exitData);
      socket.disconnect();
    }
  );

  // Handle input from client
  socket.on("input", (data: string) => {
    ptyProcess.write(data);
  });

  // Handle terminal resize
  socket.on("resize", ({ cols, rows }: ResizeData) => {
    try {
      ptyProcess.resize(cols, rows);
      console.log(`Terminal resized to ${cols}x${rows}`);
    } catch (error) {
      console.error("Error resizing terminal:", error);
    }
  });

  // Handle client disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    try {
      ptyProcess.kill();
    } catch (error) {
      console.error("Error killing PTY process:", error);
    }
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║   Web Terminal Server Running                 ║
║   Open: http://localhost:${PORT}                 ║
╚═══════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, closing server...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("\nSIGINT received, closing server...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
