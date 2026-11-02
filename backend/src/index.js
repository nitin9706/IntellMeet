import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import http from "http";
import { Server } from "socket.io";
import connectdb from "./config/db.js";
import app from "./app.js";
import { registerMeetingSocket } from "./socket/meeting.socket.js";

const port = Number(process.env.PORT || 8000);
const clientOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: clientOrigins,
    credentials: true,
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
});

registerMeetingSocket(io);

connectdb()
  .then(() => {
    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("DATABASE CONNECTION FAILED", err);
    process.exit(1);
  });
