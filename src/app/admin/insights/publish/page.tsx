'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Eye, Code } from 'lucide-react'

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

type SeoMeta = { seo_title: string; seo_description: string; og_title: string; og_description: string }
const defaultSeo: SeoMeta = { seo_title: '', seo_description: '', og_title: '', og_description: '' }

export default function PublishInsightPage() {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [seo, setSeo] = useState<SeoMeta>(defaultSeo)
  const [seoOpen, setSeoOpen] = useState(false)
  const [customTag, setCustomTag] = useState('')
  const [saving, setSaving] = useState(false)
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
    const seoMeta = Object.fromEntries(Object.entries(seo).filter(([, v]) => v.trim() !== ''))

    const { error: insertError } = await supabase.from('insights').insert({
      title: title.trim(),
      slug: slug.trim() || null,
      body: body.trim(),
      tags,
      author_id: user?.id,
      seo_meta: Object.keys(seoMeta).length > 0 ? seoMeta : null,
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
        <p className="text-accent font-extrabold text-xs tracking-[0.08em] uppercase mb-2">Admin</p>
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
            className="w-full px-4 py-3 rounded-lg border border-line bg-panel text-ink placeholder:text-muted/50 focus:outline-none focus:border-accent transition-colors text-base"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-bold text-ink mb-2">URL Slug</label>
          <input
            type="text"
            value={slug}
            onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'))}
            placeholder="e.g., india-hotels-sector-overpriced"
            className="w-full px-4 py-3 rounded-lg border border-line bg-panel text-ink placeholder:text-muted/50 focus:outline-none focus:border-accent transition-colors text-base font-mono"
          />
          <p className="text-xs text-muted mt-1">URL: /insights/<span className="font-mono">{slug || 'your-slug-here'}</span>. Leave blank to use the post ID.</p>
        </div>

        {/* SEO */}
        <div className="border border-line rounded-lg">
          <button
            type="button"
            onClick={() => setSeoOpen(o => !o)}
            className="w-full flex items-center justify-between px-4 py-3 text-left"
          >
            <span className="text-sm font-bold text-ink">SEO Metadata <span className="text-xs font-normal text-muted ml-1">optional</span></span>
            <span className="text-muted text-sm">{seoOpen ? '▲' : '▼'}</span>
          </button>
          {seoOpen && (
            <div className="px-4 pb-4 space-y-3 border-t border-line pt-3">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">SEO Title <span className="text-muted font-normal">(max 65 chars)</span></label>
                <input type="text" value={seo.seo_title} onChange={e => setSeo(p => ({ ...p, seo_title: e.target.value }))}
                  maxLength={65}
                  className="w-full px-3 py-2 rounded-lg border border-line bg-panel text-ink text-sm focus:outline-none focus:border-accent"
                  placeholder="Leave blank to use insight title" />
                <p className="text-xs text-muted mt-1">{seo.seo_title.length}/65</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Meta Description <span className="text-muted font-normal">(max 160 chars)</span></label>
                <textarea value={seo.seo_description} onChange={e => setSeo(p => ({ ...p, seo_description: e.target.value }))}
                  maxLength={160} rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-line bg-panel text-ink text-sm focus:outline-none focus:border-accent resize-none"
                  placeholder="Leave blank to auto-extract from body" />
                <p className="text-xs text-muted mt-1">{seo.seo_description.length}/160</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">OG Title <span className="text-muted font-normal">(social preview)</span></label>
                <input type="text" value={seo.og_title} onChange={e => setSeo(p => ({ ...p, og_title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-line bg-panel text-ink text-sm focus:outline-none focus:border-accent"
                  placeholder="Leave blank to use SEO title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">OG Description <span className="text-muted font-normal">(social preview)</span></label>
                <textarea value={seo.og_description} onChange={e => setSeo(p => ({ ...p, og_description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-line bg-panel text-ink text-sm focus:outline-none focus:border-accent resize-none"
                  placeholder="Leave blank to use meta description" />
              </div>
            </div>
          )}
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
              placeholder="Paste your HTML here. The title will be auto-extracted from the first heading."
              className="w-full px-4 py-3 rounded-lg border border-line bg-panel text-ink placeholder:text-muted/50 focus:outline-none focus:border-accent transition-colors text-sm leading-[1.8] resize-y font-mono"
            />
          )}
          <p className="text-xs text-muted mt-1.5">
            Paste HTML exported from Notion, Word, or any editor. Title auto-fills from the first heading.
          </p>
        </div>

        {error && (
          <p className="text-negative text-sm font-medium">{error}</p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="min-h-[46px] px-8 bg-ink text-paper rounded-lg font-bold text-ui hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0"
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
