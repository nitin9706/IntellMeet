import { PlayCircle } from 'lucide-react'
import { api } from '../lib/api'
import useFetch from '../hooks/useFetch'
import { Empty, ErrorBanner, PageHeader, Panel } from '../components/ui'

export default function Recordings() {
  const { data: recordings, loading, error, reload } = useFetch(api.recordings)
  return (
    <>
      <PageHeader title="Recordings" subtitle="Replay past meetings." />
      <ErrorBanner message={error} onRetry={reload} />
      <Panel>
        {loading ? <p className="text-sm text-muted">Loading recordings…</p> : recordings.length === 0 ? (
          <Empty icon={PlayCircle} title="No recordings yet" text="Recorded meetings will be listed here." />
        ) : (
          <ul className="divide-y divide-line">
            {recordings.map((r) => (
              <li key={r._id} className="flex items-center justify-between py-3">
                <span className="font-semibold">{r.title || 'Untitled recording'}</span>
                {r.url && <a href={r.url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-brand">Play</a>}
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  )
}
