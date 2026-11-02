// Central API client. Adjust endpoint paths below to match your Express backend.
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const tokenStore = {
  get: () => localStorage.getItem("im_token"),
  set: (t) => localStorage.setItem("im_token", t),
  clear: () => localStorage.removeItem("im_token"),
};

async function request(path, { method = "GET", body } = {}) {
  const token = tokenStore.get();
  let res;

  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(
      "Cannot reach the server. Check that the backend is running.",
    );
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }

  return data.data ?? data;
}

export const api = {
  login: (b) => request("/users/login", { method: "POST", body: b }),
  googleLogin: (credential) =>
    request("/users/google-login", { method: "POST", body: { credential } }),
  register: (b) => request("/users/register", { method: "POST", body: b }),
  refreshToken: () => request("/users/refresh-token", { method: "POST" }),
  logout: () => request("/users/logout", { method: "POST" }),
  currentUser: () => request("/users/current-user"),

  meetings: () => request("/meetings/my"),
  createMeeting: (b) =>
    request("/meetings/create", { method: "POST", body: b }),
  getMeetingById: (meetingId) => request(`/meetings/${meetingId}`),
  updateMeetingStatus: (meetingId, status) =>
    request(`/meetings/${meetingId}/status`, {
      method: "PATCH",
      body: { status },
    }),

  inviteToMeeting: (meetingId, body) =>
    request(`/meetings/${meetingId}/invite`, { method: "POST", body }),
  joinMeeting: (meetingId) =>
    request(`/meetings/${meetingId}/join`, { method: "POST" }),
  acceptInvitation: (meetingId) =>
    request(`/meetings/${meetingId}/accept-invite`, { method: "POST" }),
  getMeetingMembers: (meetingId) => request(`/meetings/${meetingId}/members`),

  createMessage: (meetingId, body) =>
    request(`/meetings/${meetingId}/messages`, { method: "POST", body }),
  fetchMessages: (meetingId) => request(`/meetings/${meetingId}/messages`),
  fetchMeetingEvents: (meetingId) => request(`/meetings/${meetingId}/events`),

  recordings: () => request("/recordings/my"),
  summarize: (transcript) =>
    request("/summaries", { method: "POST", body: { transcript } }),
};
