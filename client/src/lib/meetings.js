export const getStart = (m) => new Date(m.startTime || m.date || m.scheduledAt)
export const getStatus = (m) => {
  const s = getStart(m).getTime(), now = Date.now()
  const end = s + (m.duration || 60) * 60000
  return now > end ? 'expired' : now >= s ? 'live' : 'upcoming'
}
export const sameDay = (a, b) => a.toDateString() === b.toDateString()
