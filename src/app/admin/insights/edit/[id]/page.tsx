'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Trash2, Eye, Code } from 'lucide-react'

const SUGGESTED_TAGS = ['Macro', 'Hospitality', 'Technology', 'Manufacturing', 'Valuation', 'Sector Note', 'Company Watch']

function extractTitle(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.querySelector('h1, h2, h3')?.textContent?.trim() || ''
}

function stripHtml(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || ''
}

export default function EditInsightPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(false)

  const wordCount = body.trim() ? stripHtml(body).trim().split(/\s+/).filter(Boolean).length : 0

  const handleBodyChange = (html: string) => {
    setBody(html)
    if (!title.trim()) {
      const extracted = extractTitle(html)
      if (extracted) setTitle(extracted)
    }
  }

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('insights')
        .select('*')
        .eq('id', params.id)
        .single()

      if (data) {
        setTitle(data.title)
        setBody(data.body)
        setTags(data.tags ?? [])
      }
      setLoading(false)
    }
    fetch()
  }, [params.id, supabase])

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  const addCustomTag = () => {
    const trimmed = customTag.trim()
    if (trimmed && !tags.includes(trimmed)) setTags(prev => [...prev, trimmed])
    setCustomTag('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!title.trim() || !body.trim()) {
      setError('Title and body are required.')
      return
    }

    setSaving(true)
    const { error: updateError } = await supabase
      .from('insights')
      .update({ title: title.trim(), body: body.trim(), tags })
      .eq('id', params.id)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    router.push(`/insights/${params.id}`)
    router.refresh()
  }

  const handleDelete = async () => {
    if (!confirm('Delete this insight? This cannot be undone.')) return
    setDeleting(true)
    await supabase.from('insights').delete().eq('id', params.id)
    router.push('/insights')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-muted">Loading…</div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-[54px] pb-[86px]">

      <Link
        href="/admin/dashboard"
        className="inline-flex items-center gap-2 text-muted text-sm hover:text-ink transition-colors mb-10"
      >
        <ArrowLeft className="w-4 h-4" />
        Dashboard
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-accent font-extrabold text-xs tracking-[0.08em] uppercase mb-2">Admin</p>
          <h1 className="text-2xl font-bold text-ink">Edit Insight</h1>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-negative/30 text-negative text-sm font-bold hover:bg-negative/5 transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Title */}
        <div>
          <label className="block text-sm font-bold text-ink mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-line bg-panel text-ink placeholder:text-muted/50 focus:outline-none focus:border-accent transition-colors text-base"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-bold text-ink mb-2">Tags</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {SUGGESTED_TAGS.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                  tags.includes(tag)
                    ? 'bg-accent text-paper border-accent'
                    : 'bg-panel text-muted border-line hover:border-accent/50'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={customTag}
              onChange={e => setCustomTag(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomTag() } }}
              placeholder="Add custom tag…"
              className="flex-1 px-3 py-2 rounded-lg border border-line bg-panel text-ink placeholder:text-muted/50 focus:outline-none focus:border-accent transition-colors text-sm"
            />
            <button
              type="button"
              onClick={addCustomTag}
              className="px-4 py-2 rounded-lg border border-line text-muted text-sm font-bold hover:border-accent/50 transition-colors"
            >
              Add
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 text-xs font-bold text-accent bg-accent/8 px-2 py-0.5 rounded">
                  {tag}
                  <button type="button" onClick={() => toggleTag(tag)} className="ml-0.5 hover:text-negative">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-ink">HTML Content</label>
            <div className="flex items-center gap-3">
              <span className={`text-xs ${wordCount > 500 ? 'text-caution' : 'text-muted'}`}>
                {wordCount} words
              </span>
              <button
                type="button"
                onClick={() => setPreview(p => !p)}
                className="flex items-center gap-1.5 text-xs font-bold text-muted hover:text-ink transition-colors"
              >
                {preview ? <><Code className="w-3.5 h-3.5" /> Edit HTML</> : <><Eye className="w-3.5 h-3.5" /> Preview</>}
              </button>
            </div>
          </div>
          {preview ? (
            <div
              className="rich-editor min-h-[400px] p-5 rounded-lg border border-line bg-paper text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: body }}
            />
          ) : (
            <textarea
              value={body}
              onChange={e => handleBodyChange(e.target.value)}
              rows={18}
              className="w-full px-4 py-3 rounded-lg border border-line bg-panel text-ink placeholder:text-muted/50 focus:outline-none focus:border-accent transition-colors text-sm leading-[1.8] resize-y font-mono"
            />
          )}
          <p className="text-xs text-muted mt-1.5">
            Paste HTML exported from Notion, Word, or any editor. Title auto-fills from the first heading.
          </p>
        </div>

        {error && <p className="text-negative text-sm font-medium">{error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="min-h-[46px] px-8 bg-ink text-paper rounded-lg font-bold text-ui hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <Link
            href={`/insights/${params.id}`}
            className="text-sm text-muted hover:text-ink transition-colors"
          >
            Cancel
          </Link>
        </div>

      </form>
    </div>
  )
}
