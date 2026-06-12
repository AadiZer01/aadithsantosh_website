'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Send, FileText } from 'lucide-react'
import RichTextEditor from '@/components/RichTextEditor'

// ─── Metadata type ──────────────────────────────────────────────────────────

type ReportMeta = {
  ticker: string
  sector: string
  valuation_date: string
  tagline: string
  rating: string
  tp_range: string
  weighted_avg_tp: string
  cmp: string
  implied_upside: string
  horizon: string
  risk_level: string
  market_cap: string
  high_52w: string
  low_52w: string
  shares_outstanding: string
  pe_ratio: string
  ev_ebitda: string
  dividend_yield: string
  roce_roe: string
  nse_bse: string
}

const defaultMeta: ReportMeta = {
  ticker: '',
  sector: '',
  valuation_date: '',
  tagline: '',
  rating: 'HOLD',
  tp_range: '',
  weighted_avg_tp: '',
  cmp: '',
  implied_upside: '',
  horizon: '12-18 months',
  risk_level: 'Medium',
  market_cap: '',
  high_52w: '',
  low_52w: '',
  shares_outstanding: '',
  pe_ratio: '',
  ev_ebitda: '',
  dividend_yield: '',
  roce_roe: '',
  nse_bse: '',
}

// ─── Main Publish Page ──────────────────────────────────────────────────────

export default function PublishPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [meta, setMeta] = useState<ReportMeta>(defaultMeta)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [checking, setChecking] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (!profile || profile.role !== 'admin') { router.push('/'); return }
      setChecking(false)
    }
    checkAdmin()
  }, [supabase, router])

  const updateMeta = (key: keyof ReportMeta, value: string) => {
    setMeta((prev) => ({ ...prev, [key]: value }))
  }

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Unauthorized.')
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (!profile || profile.role !== 'admin') throw new Error('Unauthorized.')

      let pdf_url: string | null = null
      if (pdfFile) {
        const ext = pdfFile.name.split('.').pop()
        const fileName = `reports/${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`
        const { error: uploadError } = await supabase.storage.from('research-pdfs').upload(fileName, pdfFile)
        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabase.storage.from('research-pdfs').getPublicUrl(fileName)
        pdf_url = publicUrl
      }

      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = content
      const excerpt = meta.tagline || tempDiv.textContent?.substring(0, 200) || ''

      const { error: insertError } = await supabase.from('research_posts').insert({
        title,
        content,
        excerpt,
        pdf_url,
        author_id: user.id,
        report_meta: meta,
      })

      if (insertError) throw insertError

      setSuccess(true)
      setTitle('')
      setContent('')
      setPdfFile(null)
      setMeta(defaultMeta)

      setTimeout(() => { router.push('/research'); router.refresh() }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-muted">Checking authorization...</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink">Publish Research Report</h1>
        <p className="text-muted mt-1">Create a structured equity research report</p>
      </div>

      {success ? (
        <div className="bg-positive/10 border border-positive/20 rounded-lg p-6 text-center">
          <Send className="w-12 h-12 text-positive mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-positive mb-2">Published Successfully!</h2>
          <p className="text-positive">Redirecting to research page...</p>
        </div>
      ) : (
        <form onSubmit={handlePublish} className="space-y-8">

          {/* ── Section 1: Basic Info ── */}
          <div className="bg-panel border border-line rounded-lg p-6">
            <h2 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent" /> Report Information
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-ink mb-1">Report Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="e.g., Eternal Ltd. — Quick Commerce Expansion" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">NSE Ticker</label>
                <input type="text" value={meta.ticker} onChange={(e) => updateMeta('ticker', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="e.g., ETERNAL" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Sector</label>
                <input type="text" value={meta.sector} onChange={(e) => updateMeta('sector', e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="e.g., Quick Commerce" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-ink mb-1">Valuation Date</label>
                <input type="date" value={meta.valuation_date} onChange={(e) => updateMeta('valuation_date', e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-ink mb-1">Tagline / Investment Thesis</label>
                <textarea value={meta.tagline} onChange={(e) => updateMeta('tagline', e.target.value)} rows={2}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  placeholder="e.g., Blinkit-driven growth story with execution risk in quick commerce expansion." />
              </div>
            </div>
          </div>

          {/* ── Section 2: Rating & Valuation Table ── */}
          <div className="bg-panel border border-line rounded-lg p-6">
            <h2 className="text-lg font-bold text-ink mb-4">Rating &amp; Valuation</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Rating</label>
                <select value={meta.rating} onChange={(e) => updateMeta('rating', e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent">
                  <option value="BUY">BUY</option>
                  <option value="ACCUMULATE">ACCUMULATE</option>
                  <option value="HOLD">HOLD</option>
                  <option value="SELL">SELL</option>
                  <option value="UNDER REVIEW">UNDER REVIEW</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">TP Range</label>
                <input type="text" value={meta.tp_range} onChange={(e) => updateMeta('tp_range', e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm" placeholder="e.g., ₹1,200 – ₹1,500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Weighted Avg. TP</label>
                <input type="text" value={meta.weighted_avg_tp} onChange={(e) => updateMeta('weighted_avg_tp', e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm" placeholder="e.g., ₹1,350" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">CMP</label>
                <input type="text" value={meta.cmp} onChange={(e) => updateMeta('cmp', e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm" placeholder="e.g., ₹980" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Implied Upside/Downside</label>
                <input type="text" value={meta.implied_upside} onChange={(e) => updateMeta('implied_upside', e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm" placeholder="e.g., +37.8%" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Investment Horizon</label>
                <input type="text" value={meta.horizon} onChange={(e) => updateMeta('horizon', e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Risk Level</label>
                <select value={meta.risk_level} onChange={(e) => updateMeta('risk_level', e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Section 3: Company Snapshot ── */}
          <div className="bg-panel border border-line rounded-lg p-6">
            <h2 className="text-lg font-bold text-ink mb-4">Company Snapshot</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Market Cap</label>
                <input type="text" value={meta.market_cap} onChange={(e) => updateMeta('market_cap', e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm" placeholder="e.g., ₹12,500 Cr" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">52Wk High</label>
                <input type="text" value={meta.high_52w} onChange={(e) => updateMeta('high_52w', e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm" placeholder="e.g., ₹1,020" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">52Wk Low</label>
                <input type="text" value={meta.low_52w} onChange={(e) => updateMeta('low_52w', e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm" placeholder="e.g., ₹540" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Shares Outstanding</label>
                <input type="text" value={meta.shares_outstanding} onChange={(e) => updateMeta('shares_outstanding', e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm" placeholder="e.g., 125 Cr" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">P/E Ratio</label>
                <input type="text" value={meta.pe_ratio} onChange={(e) => updateMeta('pe_ratio', e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm" placeholder="e.g., 45.2x" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">EV/EBITDA</label>
                <input type="text" value={meta.ev_ebitda} onChange={(e) => updateMeta('ev_ebitda', e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm" placeholder="e.g., 28.5x" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Dividend Yield</label>
                <input type="text" value={meta.dividend_yield} onChange={(e) => updateMeta('dividend_yield', e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm" placeholder="e.g., 0.4%" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">ROCE / ROE</label>
                <input type="text" value={meta.roce_roe} onChange={(e) => updateMeta('roce_roe', e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm" placeholder="e.g., 12% / 8%" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">NSE / BSE</label>
                <input type="text" value={meta.nse_bse} onChange={(e) => updateMeta('nse_bse', e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm" placeholder="e.g., ETERNAL:NS" />
              </div>
            </div>
          </div>

          {/* ── Section 4: Report Body (Rich Text) ── */}
          <div className="bg-panel border border-line rounded-lg p-6">
            <h2 className="text-lg font-bold text-ink mb-4">Report Body</h2>
            <p className="text-xs text-muted mb-3">Use the toolbar to format text, insert tables, and add charts/images.</p>
            <RichTextEditor content={content} onChange={setContent} />
          </div>

          {/* ── Section 5: PDF Upload ── */}
          <div className="bg-panel border border-line rounded-lg p-6">
            <h2 className="text-lg font-bold text-ink mb-4">PDF Attachment (Optional)</h2>
            <input type="file" accept=".pdf" onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-accent file:text-white hover:file:bg-accent/90" />
            {pdfFile && <p className="text-xs text-muted mt-2">Selected: {pdfFile.name}</p>}
          </div>

          {error && (
            <div className="text-sm text-negative bg-negative/10 px-3 py-2 rounded-lg">{error}</div>
          )}

          <button type="submit" disabled={loading || !title.trim() || !content.trim()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-paper rounded-lg font-bold text-[0.95rem] hover:bg-ink/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            <Send className="w-4 h-4" />
            {loading ? 'Publishing...' : 'Publish Report'}
          </button>
        </form>
      )}
    </div>
  )
}
