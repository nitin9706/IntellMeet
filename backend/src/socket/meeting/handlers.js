import { Meeting } from "../../models/meetings.model.js";
import { sendMeetingMessage } from "../../services/meeting.service.js";
import {
  roomKey,
  getParticipantSnapshot,
  isHostActionAllowed,
} from "./utils.js";

export function createMeetingHandlers(io, roomMembers) {
  return {
    handleJoinMeeting(socket, payload, ack = () => {}) {
      return (async () => {
        try {
          const { normalizeMeetingId } = await import("./utils.js");
          const meetingId = normalizeMeetingId(payload?.meetingId);

          if (!meetingId) {
            return ack({ ok: false, error: "Invalid meeting ID" });
          }

          if (
            socket.data.currentMeetingId &&
            socket.data.currentMeetingId !== meetingId
          ) {
            this.leaveMeeting(socket);
          }

          if (socket.data.currentMeetingId === meetingId) {
            return ack({
              ok: false,
              error: "This socket is already in the meeting",
            });
          }

          const access = await import("./meetingAccess.js").then((m) =>
            m.authorizeMeeting({ meetingId, userId: socket.data.user.id }),
          );

          if (!access?.allowed) {
            return ack({ ok: false, error: "Meeting access denied" });
          }

          const roomId = roomKey(meetingId);
          let members = roomMembers.get(meetingId);

          if (!members) {
            members = new Map();
            roomMembers.set(meetingId, members);
          }

          const duplicateUser = [...members.values()].some(
            (member) => member.userId === socket.data.user.id,
          );

          if (duplicateUser) {
            return ack({
              ok: false,
              error: "This user is already in the meeting",
            });
          }

          const MAX_PARTICIPANTS = 20;
          if (members.size >= MAX_PARTICIPANTS) {
            return ack({ ok: false, error: "Meeting is full" });
          }

          const existingParticipants = getParticipantSnapshot(members);

          members.set(socket.id, {
            userId: socket.data.user.id,
            name: socket.data.user.name,
            micOn: true,
            cameraOn: true,
            isHost: Boolean(access.isHost),
            connected: true,
          });

          socket.data.currentMeetingId = meetingId;
          socket.data.meetingId = meetingId;
          await socket.join(roomId);

          ack({
            ok: true,
            selfId: socket.id,
            meetingId,
            participants: existingParticipants,
            isHost: Boolean(access.isHost),
          });

          socket.to(roomId).emit("participant:joined", {
            socketId: socket.id,
            userId: socket.data.user.id,
            name: socket.data.user.name,
            micOn: true,
            cameraOn: true,
            isHost: Boolean(access.isHost),
          });
        } catch (error) {
          ack({ ok: false, error: error?.message || "Unable to join meeting" });
        }
      })();
    },

    leaveMeeting(socket) {
      const currentMeetingId = socket.data.currentMeetingId;
      if (!currentMeetingId) return;

      const meetingId = currentMeetingId;
      const key = roomKey(meetingId);
      const members = roomMembers.get(meetingId);

      members?.delete(socket.id);
      socket.leave(key);

      socket.to(key).emit("participant:left", {
        socketId: socket.id,
        userId: socket.data.user?.id,
        name: socket.data.user?.name,
      });

      if (members && members.size === 0) {
        roomMembers.delete(meetingId);
      }

      socket.data.currentMeetingId = null;
      delete socket.data.meetingId;
    },

    handleParticipantState(socket, state = {}) {
      const currentMeetingId = socket.data.currentMeetingId;
      if (!currentMeetingId) return;

      const members = roomMembers.get(currentMeetingId);
      const member = members?.get(socket.id);
      if (!member) return;

      if (typeof state.micOn === "boolean") member.micOn = state.micOn;
      if (typeof state.cameraOn === "boolean") member.cameraOn = state.cameraOn;

      io.to(roomKey(currentMeetingId)).emit("participant:updated", {
        socketId: socket.id,
        userId: socket.data.user?.id,
        name: socket.data.user?.name,
        micOn: Boolean(member.micOn),
        cameraOn: Boolean(member.cameraOn),
      });
    },

    handleWebrtcSignal(socket, { targetId, description, candidate } = {}) {
      const currentMeetingId = socket.data.currentMeetingId;
      if (!currentMeetingId || typeof targetId !== "string") return;

      const members = roomMembers.get(currentMeetingId);
      if (!members?.has(targetId)) return;

      if (
        description &&
        typeof description === "object" &&
        !["offer", "answer", "rollback"].includes(description.type)
      ) {
        return;
      }

      if (
        description &&
        typeof description === "object" &&
        typeof description.sdp !== "string"
      ) {
        return;
      }

      if (candidate && typeof candidate !== "object") return;

      io.to(targetId).emit("webrtc:signal", {
        fromId: socket.id,
        description,
        candidate,
      });
    },

    handleChatSend: async (socket, payload = {}, ack = () => {}) => {
      try {
        const currentMeetingId = socket.data.currentMeetingId;
        if (!currentMeetingId) {
          return ack({ ok: false, error: "Not in a meeting" });
        }

        const text =
          typeof payload?.text === "string" ? payload.text.trim() : "";
        if (!text || text.length > 2000) {
          return ack({ ok: false, error: "Invalid message" });
        }

        const { message } = await sendMeetingMessage({
          meetingId: currentMeetingId,
          userId: socket.data.user.id,
          content: text,
          clientMessageId: payload?.clientMessageId || null,
        });

        const messagePayload = {
          id: String(message._id || message.id || ""),
          meetingId: currentMeetingId,
          senderId: socket.data.user.id,
          senderName: socket.data.user.name,
          text: message.content,
          type: message.type,
          sentAt: message.createdAt || new Date().toISOString(),
          clientMessageId: payload?.clientMessageId || null,
        };

        io.to(roomKey(currentMeetingId)).emit("chat:message", messagePayload);
        ack({ ok: true, messageId: messagePayload.id });
      } catch (error) {
        ack({ ok: false, error: error?.message || "Unable to send message" });
      }
    },

    handleParticipantMuteRequest(socket, payload = {}, ack = () => {}) {
      const currentMeetingId = socket.data.currentMeetingId;
      if (!currentMeetingId) {
        return ack({ ok: false, error: "Not in a meeting" });
      }

      const targetId =
        typeof payload?.targetId === "string" ? payload.targetId : "";
      const members = roomMembers.get(currentMeetingId);
      const senderMember = members?.get(socket.id);
      const targetMember = targetId ? members?.get(targetId) : null;

      if (!senderMember || !targetMember) {
        return ack({ ok: false, error: "Participant not found" });
      }

      const meeting = socket.data.meeting || null;
      const isHost =
        meeting?.hostId &&
        String(meeting.hostId) === String(socket.data.user.id);
      if (!isHost) {
        return ack({ ok: false, error: "Only hosts can request mute" });
      }

      io.to(targetId).emit("participant:mute-request", {
        requestedBy: socket.id,
        requestedByUserId: socket.data.user.id,
        requestedByName: socket.data.user.name,
        muted: true,
        reason:
          typeof payload?.reason === "string"
            ? payload.reason
            : "Host requested mute",
      });

      ack({ ok: true });
    },

    handleMeetingEnded: async (socket, ack = () => {}) => {
      try {
        const currentMeetingId = socket.data.currentMeetingId;
        if (!currentMeetingId) {
          return ack({ ok: false, error: "Not in a meeting" });
        }

        const meeting = await Meeting.findById(currentMeetingId);
        if (!meeting) {
          return ack({ ok: false, error: "Meeting not found" });
        }

        const isHost = isHostActionAllowed(meeting, socket.data.user.id);
        if (!isHost) {
          return ack({ ok: false, error: "Only the host can end the meeting" });
        }

        meeting.status = "ended";
        meeting.endedAt = new Date();
        await meeting.save();

        io.to(roomKey(currentMeetingId)).emit("meeting:ended", {
          meetingId: currentMeetingId,
          endedBy: socket.data.user.id,
        });

        ack({ ok: true });
        for (const socketId of [
          ...(roomMembers.get(currentMeetingId) || new Map()).keys(),
        ]) {
          const peerSocket = io.sockets.sockets.get(socketId);
          peerSocket?.leave(roomKey(currentMeetingId));
          peerSocket?.emit("meeting:ended", {
            meetingId: currentMeetingId,
            endedBy: socket.data.user.id,
          });
        }

        roomMembers.delete(currentMeetingId);
        socket.data.currentMeetingId = null;
      } catch (error) {
        ack({ ok: false, error: error?.message || "Unable to end meeting" });
      }
    },
  };
}
