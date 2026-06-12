'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const SUGGESTED_TAGS = ['Macro', 'Hospitality', 'Technology', 'Manufacturing', 'Valuation', 'Sector Note', 'Company Watch']

export default function PublishInsightPage() {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  const addCustomTag = () => {
    const trimmed = customTag.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed])
    }
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
    const { data: { user } } = await supabase.auth.getUser()
    const { error: insertError } = await supabase.from('insights').insert({
      title: title.trim(),
      body: body.trim(),
      tags,
      author_id: user?.id,
    })

    if (insertError) {
      setError(insertError.message)
      setSaving(false)
      return
    }

    router.push('/insights')
    router.refresh()
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

      <div className="mb-8">
        <p className="text-accent font-extrabold text-[0.78rem] tracking-[0.08em] uppercase mb-2">Admin</p>
        <h1 className="text-2xl font-bold text-ink">New Insight</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Title */}
        <div>
          <label className="block text-sm font-bold text-ink mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. India's hotel sector is pricing in too much optimism"
            className="w-full px-4 py-3 rounded-lg border border-line bg-panel text-ink placeholder:text-muted/50 focus:outline-none focus:border-accent transition-colors text-[1rem]"
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
                className={`px-3 py-1 rounded-full text-[0.78rem] font-bold border transition-colors ${
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
                <span key={tag} className="inline-flex items-center gap-1 text-[0.78rem] font-bold text-accent bg-accent/8 px-2 py-0.5 rounded">
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
            <label className="text-sm font-bold text-ink">Body</label>
            <span className={`text-xs ${wordCount > 500 ? 'text-caution' : 'text-muted'}`}>
              {wordCount} words {wordCount > 0 && wordCount < 150 && '· aim for 200–500'}
            </span>
          </div>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={16}
            placeholder="Write your insight here. Keep it focused — one idea, clearly expressed."
            className="w-full px-4 py-3 rounded-lg border border-line bg-panel text-ink placeholder:text-muted/50 focus:outline-none focus:border-accent transition-colors text-[0.97rem] leading-[1.8] resize-y"
          />
        </div>

        {error && (
          <p className="text-negative text-sm font-medium">{error}</p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="min-h-[46px] px-8 bg-ink text-paper rounded-lg font-bold text-[0.95rem] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0"
          >
            {saving ? 'Publishing…' : 'Publish Insight'}
          </button>
          <Link
            href="/insights"
            className="text-sm text-muted hover:text-ink transition-colors"
          >
            Cancel
          </Link>
        </div>

      </form>
    </div>
  )
}
