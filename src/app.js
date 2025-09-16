import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.js";
import articleRoutes from "./routes/article.js";


dotenv.config();

const app = express();
const server = http.createServer(app);

export const io = new Server(server, { cors: { origin: "*" } });

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => res.json({ status: "OK", message: "Backend is running!" }));

// Routes
app.use("/auth", authRoutes);     // -> /auth/login, /auth/register
app.use("/articles", articleRoutes); // -> /articles (no duplication now)


// Socket.io
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
   // Join user-specific room
  socket.on("join-room", (roomName) => {
    console.log(`📢 ${socket.id} joined room: ${roomName}`);
    socket.join(roomName);
  });
  
  socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
});



const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
