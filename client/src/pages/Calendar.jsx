import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { api } from '../lib/api'
import useFetch from '../hooks/useFetch'
import { getStart, sameDay } from '../lib/meetings'
import { ErrorBanner, PageHeader, Stat } from '../components/ui'

export default function Calendar() {
  const { data: meetings, error, reload } = useFetch(api.meetings)
  const [cursor, setCursor] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const first = cursor.getDay()
  const days = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => new Date(cursor.getFullYear(), cursor.getMonth(), i + 1))]
  const inMonth = meetings.filter((m) => getStart(m).getMonth() === cursor.getMonth() && getStart(m).getFullYear() === cursor.getFullYear())
  const shift = (n) => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + n, 1))

  return (
    <>
      <PageHeader title={cursor.toLocaleString([], { month: 'long', year: 'numeric' })} subtitle="Your meetings by day."
        action={
          <div className="flex gap-2">
            <button aria-label="Previous month" onClick={() => shift(-1)} className="rounded-lg border border-line p-2 hover:bg-surface"><ChevronLeft size={18} /></button>
            <button aria-label="Next month" onClick={() => shift(1)} className="rounded-lg border border-line p-2 hover:bg-surface"><ChevronRight size={18} /></button>
          </div>
        } />
      <ErrorBanner message={error} onRetry={reload} />
      <div className="mb-6 grid grid-cols-2 gap-4">
        <Stat label="Meetings this month" value={inMonth.length} />
        <Stat label="Meetings today" value={meetings.filter((m) => sameDay(getStart(m), new Date())).length} />
      </div>
      <div className="overflow-x-auto rounded-xl border border-line bg-surface">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-7 border-b border-line text-center text-sm text-muted">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <div key={d} className="py-3">{d}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((d, i) => {
              const items = d ? meetings.filter((m) => sameDay(getStart(m), d)) : []
              const today = d && sameDay(d, new Date())
              return (
                <div key={i} className="min-h-24 border-b border-r border-line p-2">
                  {d && <span className={`grid h-7 w-7 place-items-center rounded-full text-sm ${today ? 'bg-brand font-bold text-white' : ''}`}>{d.getDate()}</span>}
                  {items.map((m) => <p key={m._id} className="mt-1 truncate rounded bg-brand/15 px-1.5 py-0.5 text-xs font-medium text-brand-dark">{m.title}</p>)}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
