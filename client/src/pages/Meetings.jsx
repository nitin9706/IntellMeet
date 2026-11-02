import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, Video } from 'lucide-react'
import { api } from '../lib/api'
import useFetch from '../hooks/useFetch'
import { getStart, getStatus } from '../lib/meetings'
import { Button, Empty, ErrorBanner, Field, Modal, PageHeader, Panel, Stat, StatusBadge } from '../components/ui'

export default function Meetings() {
  const { data: meetings, error, reload } = useFetch(api.meetings)
  const [params, setParams] = useSearchParams()
  const open = params.get('new') === '1'
  const [form, setForm] = useState({ title: '', date: '', time: '' })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const count = (s) => meetings.filter((m) => getStatus(m) === s).length
  const close = () => setParams({})

  const create = async (e) => {
    e.preventDefault(); setSaving(true); setFormError('')
    try {
      await api.createMeeting({ title: form.title, startTime: new Date(`${form.date}T${form.time}`).toISOString() })
      setForm({ title: '', date: '', time: '' }); close(); reload()
    } catch (err) { setFormError(err.message) }
    finally { setSaving(false) }
  }

  return (
    <>
      <PageHeader title="My meetings" subtitle="Create, view and manage your meetings."
        action={<Button onClick={() => setParams({ new: '1' })}><Plus size={16} /> New meeting</Button>} />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Total" value={meetings.length} />
        <Stat label="Upcoming" value={count('upcoming')} />
        <Stat label="Live now" value={count('live')} />
        <Stat label="Expired" value={count('expired')} />
      </div>
      <ErrorBanner message={error} onRetry={reload} />
      <Panel>
        {meetings.length === 0 ? (
          <Empty icon={Video} title="No meetings yet" text="Create a meeting to get a room link you can share."
            action={<Button onClick={() => setParams({ new: '1' })}>Create meeting</Button>} />
        ) : (
          <ul className="divide-y divide-line">
            {meetings.map((m) => (
              <li key={m._id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                <div>
                  <p className="font-semibold">{m.title}</p>
                  <p className="text-sm text-muted">{getStart(m).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={getStatus(m)} />
                  <Link to={`/room/${m._id}`}><Button variant="ghost" className="!py-1.5">Join</Button></Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <Modal open={open} onClose={close} title="New meeting">
        <ErrorBanner message={formError} />
        <form onSubmit={create} className="space-y-4">
          <Field label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <Field label="Time" type="time" required value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={close}>Cancel</Button>
            <Button type="submit" loading={saving}>Create meeting</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
