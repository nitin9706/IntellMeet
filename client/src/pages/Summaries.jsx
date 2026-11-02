import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { api } from '../lib/api'
import { Button, ErrorBanner, PageHeader, Panel } from '../components/ui'

export default function Summaries() {
  const [transcript, setTranscript] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const run = async () => {
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await api.summarize(transcript)
      setResult(res.summary ?? res)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <>
      <PageHeader title="AI summaries" subtitle="Turn a transcript into a summary, decisions and action items." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Meeting transcript">
          <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} rows={14}
            placeholder="Paste your meeting conversation here"
            className="w-full resize-y rounded-lg border border-line bg-bg p-3 text-sm focus:border-brand focus:outline-none" />
          <Button onClick={run} loading={loading} disabled={!transcript.trim()} className="mt-4"><Sparkles size={16} /> Generate summary</Button>
        </Panel>
        <Panel title="Summary">
          <ErrorBanner message={error} onRetry={run} />
          {result ? (
            <div className="whitespace-pre-wrap text-sm leading-relaxed">{typeof result === 'string' ? result : JSON.stringify(result, null, 2)}</div>
          ) : (
            <p className="text-sm text-muted">Your summary will appear here after you generate it.</p>
          )}
        </Panel>
      </div>
    </>
  )
}
