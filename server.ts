import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";

const db = new Database("chaton.db");

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT,
    interests TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reporter_id TEXT,
    reported_id TEXT,
    reason TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  // Real-time matching logic
  const waitingQueue: { socketId: string; userId: string; interests: string[] }[] = [];
  const activeRooms = new Map<string, { u1: string; u2: string }>();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_queue", ({ userId, interests }: { userId: string; interests: string[] }) => {
      console.log(`User ${userId} joined queue with interests:`, interests);
      
      // Try to find a match
      const matchIndex = waitingQueue.findIndex(u => u.userId !== userId);
      
      if (matchIndex !== -1) {
        const peer = waitingQueue.splice(matchIndex, 1)[0];
        const roomId = uuidv4();
        
        activeRooms.set(roomId, { u1: socket.id, u2: peer.socketId });
        
        socket.join(roomId);
        io.to(peer.socketId).emit("matched", { roomId, peerId: userId, peerSocketId: socket.id });
        socket.emit("matched", { roomId, peerId: peer.userId, peerSocketId: peer.socketId });
        
        console.log(`Matched ${socket.id} with ${peer.socketId} in room ${roomId}`);
      } else {
        waitingQueue.push({ socketId: socket.id, userId, interests });
      }
    });

    socket.on("leave_queue", () => {
      const index = waitingQueue.findIndex(u => u.socketId === socket.id);
      if (index !== -1) waitingQueue.splice(index, 1);
    });

    socket.on("send_message", ({ roomId, message, senderId }) => {
      socket.to(roomId).emit("receive_message", { message, senderId, timestamp: new Date().toISOString() });
    });

    socket.on("typing", ({ roomId, isTyping }) => {
      socket.to(roomId).emit("peer_typing", { isTyping });
    });

    // WebRTC Signaling
    socket.on("offer", ({ roomId, offer }) => {
      socket.to(roomId).emit("offer", { offer });
    });

    socket.on("answer", ({ roomId, answer }) => {
      socket.to(roomId).emit("answer", { answer });
    });

    socket.on("ice_candidate", ({ roomId, candidate }) => {
      socket.to(roomId).emit("ice_candidate", { candidate });
    });

    socket.on("skip", ({ roomId }) => {
      socket.to(roomId).emit("peer_skipped");
      socket.leave(roomId);
      activeRooms.delete(roomId);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      // Remove from queue
      const index = waitingQueue.findIndex(u => u.socketId === socket.id);
      if (index !== -1) waitingQueue.splice(index, 1);
      
      // Notify active room peers
      for (const [roomId, room] of activeRooms.entries()) {
        if (room.u1 === socket.id || room.u2 === socket.id) {
          socket.to(roomId).emit("peer_disconnected");
          activeRooms.delete(roomId);
          break;
        }
      }
    });
  });

  // API Routes
  app.use(express.json());
  
  app.post("/api/report", (req, res) => {
    const { reporterId, reportedId, reason } = req.body;
    db.prepare("INSERT INTO reports (reporter_id, reported_id, reason) VALUES (?, ?, ?)").run(reporterId, reportedId, reason);
    res.json({ success: true });
  });

  app.get("/api/stats", (req, res) => {
    const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
    const reportCount = db.prepare("SELECT COUNT(*) as count FROM reports").get() as { count: number };
    res.json({ users: userCount.count, reports: reportCount.count, online: io.engine.clientsCount });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
