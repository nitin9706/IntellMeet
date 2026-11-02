import { verifySocketToken } from "./auth.js";
import { roomKey, parseCookies, normalizeMeetingId } from "./utils.js";
import { createMeetingHandlers } from "./handlers.js";

const roomMembers = new Map();

export function registerMeetingSocket(io) {
  io.use(async (socket, next) => {
    try {
      const authToken =
        socket.handshake?.auth?.token ||
        socket.handshake?.headers?.authorization ||
        "";

      const cookieHeader = socket.request?.headers?.cookie || "";
      const cookies = parseCookies(cookieHeader);
      const cookieToken = cookies.accessToken || "";
      const token = String(authToken).replace(/^Bearer\s+/i, "") || cookieToken;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const user = await verifySocketToken(token);
      if (!user?.id) {
        return next(new Error("Invalid authentication"));
      }

      socket.data.user = {
        id: String(user.id),
        name: user.name || user.fullname || user.username || "Participant",
      };

      next();
    } catch (error) {
      next(new Error(error?.message || "Authentication failed"));
    }
  });

  const handlers = createMeetingHandlers(io, roomMembers);

  io.on("connection", (socket) => {
    socket.on("meeting:join", (payload, ack = () => {}) => {
      handlers.handleJoinMeeting(socket, payload, ack);
    });

    socket.on("participant:state", (state = {}) => {
      handlers.handleParticipantState(socket, state);
    });

    socket.on("webrtc:signal", (payload = {}) => {
      handlers.handleWebrtcSignal(socket, payload);
    });

    socket.on("chat:send", (payload = {}, ack = () => {}) => {
      handlers.handleChatSend(socket, payload, ack);
    });

    socket.on("participant:mute-request", (payload = {}, ack = () => {}) => {
      handlers.handleParticipantMuteRequest(socket, payload, ack);
    });

    socket.on("meeting:leave", () => {
      handlers.leaveMeeting(socket);
    });

    socket.on("meeting:ended", (ack = () => {}) => {
      handlers.handleMeetingEnded(socket, ack);
    });

    socket.on("disconnect", () => {
      handlers.leaveMeeting(socket);
    });
  });
}

export { roomKey, normalizeMeetingId, parseCookies };
