import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Meetings from './pages/Meetings'
import Calendar from './pages/Calendar'
import MeetingRoom from './pages/MeetingRoom'
import Summaries from './pages/Summaries'
import Recordings from './pages/Recordings'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="meetings" element={<Meetings />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="room" element={<MeetingRoom />} />
          <Route path="room/:meetingId" element={<MeetingRoom />} />
          <Route path="summaries" element={<Summaries />} />
          <Route path="recordings" element={<Recordings />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
