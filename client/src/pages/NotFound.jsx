import { Link } from 'react-router-dom'
export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <p className="font-display text-6xl font-bold">404</p>
        <p className="mt-2 text-muted">This page does not exist.</p>
        <Link to="/dashboard" className="mt-4 inline-block font-semibold text-brand">Back to dashboard</Link>
      </div>
    </div>
  )
}
