'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import {
  Bold, Italic, Heading1, Heading2, List, ListOrdered, Quote,
  Undo, Redo, Send, Table, Image, X, FileText, ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

// ─── Rich Text Editor (copied from publish page) ───────────────────────────

const HEADING_OPTIONS = [
  { label: 'Paragraph', value: 'p' },
  { label: 'Heading 1', value: 'h2' },
  { label: 'Heading 2', value: 'h3' },
  { label: 'Heading 3', value: 'h4' },
]

const FONT_SIZE_OPTIONS = [
  { label: '10', value: '1' },
  { label: '12', value: '2' },
  { label: '14', value: '3' },
  { label: '16', value: '4' },
  { label: '18', value: '5' },
  { label: '24', value: '6' },
  { label: '36', value: '7' },
]

function RichTextEditor({ content, onChange }: { content: string; onChange: (html: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [showTableModal, setShowTableModal] = useState(false)
  const [tableRows, setTableRows] = useState(3)
  const [tableCols, setTableCols] = useState(3)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set())
  const [currentHeading, setCurrentHeading] = useState('p')
  const supabase = createClient()

  const updateActiveFormats = useCallback(() => {
    const fmt = new Set<string>()
    if (document.queryCommandState('bold')) fmt.add('bold')
    if (document.queryCommandState('italic')) fmt.add('italic')
    if (document.queryCommandState('underline')) fmt.add('underline')
    if (document.queryCommandState('strikeThrough')) fmt.add('strike')
    if (document.queryCommandState('insertUnorderedList')) fmt.add('ul')
    if (document.queryCommandState('insertOrderedList')) fmt.add('ol')
    setActiveFormats(fmt)
    let heading = 'p'
    if (document.queryCommandValue('formatBlock')) {
      const val = document.queryCommandValue('formatBlock').toLowerCase()
      if (['h2', 'h3', 'h4'].includes(val)) heading = val
    }
    setCurrentHeading(heading)
  }, [])

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value)
    if (editorRef.current) onChange(editorRef.current.innerHTML)
    updateActiveFormats()
    editorRef.current?.focus()
  }, [onChange, updateActiveFormats])

  const handleSelect = useCallback(() => { updateActiveFormats() }, [updateActiveFormats])
  const handleInput = useCallback(() => { if (editorRef.current) onChange(editorRef.current.innerHTML) }, [onChange])

  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (editorRef.current && !ready) {
      editorRef.current.innerHTML = content
      setReady(true)
    }
  }, [content, ready])

  const insertTable = () => {
    let html = '<table style="width:100%;border-collapse:collapse;margin:1rem 0;">\n'
    for (let r = 0; r < tableRows; r++) {
      html += '  <tr>\n'
      for (let c = 0; c < tableCols; c++) {
        const isHeader = r === 0
        const tag = isHeader ? 'th' : 'td'
        html += `    <${tag} style="border:1px solid #D8CFCB;padding:8px 12px;text-align:left;${isHeader ? 'background:#FFF7F3;font-weight:700;' : ''}">${isHeader ? `Header ${c + 1}` : ''}</${tag}>\n`
      }
      html += '  </tr>\n'
    }
    html += '</table>'
    document.execCommand('insertHTML', false, html)
    if (editorRef.current) onChange(editorRef.current.innerHTML)
    setShowTableModal(false)
    editorRef.current?.focus()
  }

  const insertImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const ext = file.name.split('.').pop()
      const fileName = `reports/${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`
      const { error: uploadError } = await supabase.storage.from('report-images').upload(fileName, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('report-images').getPublicUrl(fileName)
      document.execCommand('insertHTML', false, `<img src="${publicUrl}" alt="chart" style="max-width:100%;margin:1rem 0;border-radius:8px;" />`)
      if (editorRef.current) onChange(editorRef.current.innerHTML)
    } catch (err: any) { alert('Failed to upload image: ' + err.message) }
    finally { setUploadingImage(false); e.target.value = '' }
  }

  const [showPlaceholder, setShowPlaceholder] = useState(!content)
  useEffect(() => { setShowPlaceholder(!content) }, [content])

  return (
    <div className="border border-line rounded-lg overflow-hidden shadow-sm">
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 border-b border-line bg-paper select-none">
        <button type="button" onClick={() => execCommand('undo')} className="p-1.5 rounded hover:bg-line/50 text-muted" title="Undo (Ctrl+Z)"><Undo className="w-[18px] h-[18px]" /></button>
        <button type="button" onClick={() => execCommand('redo')} className="p-1.5 rounded hover:bg-line/50 text-muted" title="Redo (Ctrl+Y)"><Redo className="w-[18px] h-[18px]" /></button>
        <span className="w-px h-5 bg-line mx-1.5" />
        <button type="button" onClick={() => execCommand('bold')} className={`p-1.5 rounded hover:bg-line/50 ${activeFormats.has('bold') ? 'bg-line/60 text-ink' : 'text-muted'}`} title="Bold (Ctrl+B)"><Bold className="w-[18px] h-[18px]" /></button>
        <button type="button" onClick={() => execCommand('italic')} className={`p-1.5 rounded hover:bg-line/50 ${activeFormats.has('italic') ? 'bg-line/60 text-ink' : 'text-muted'}`} title="Italic (Ctrl+I)"><Italic className="w-[18px] h-[18px]" /></button>
        <button type="button" onClick={() => execCommand('underline')} className={`p-1.5 rounded hover:bg-line/50 ${activeFormats.has('underline') ? 'bg-line/60 text-ink' : 'text-muted'}`} title="Underline (Ctrl+U)"><span className="text-sm font-bold leading-none" style={{ textDecoration: 'underline' }}>U</span></button>
        <button type="button" onClick={() => execCommand('strikeThrough')} className={`p-1.5 rounded hover:bg-line/50 ${activeFormats.has('strike') ? 'bg-line/60 text-ink' : 'text-muted'}`} title="Strikethrough"><span className="text-sm font-bold leading-none" style={{ textDecoration: 'line-through' }}>S</span></button>
        <span className="w-px h-5 bg-line mx-1.5" />
        <select value={currentHeading} onChange={(e) => execCommand('formatBlock', e.target.value)} className="text-xs px-2 py-1 rounded border border-line bg-paper text-ink focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer">
          {HEADING_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
        </select>
        <select onChange={(e) => execCommand('fontSize', e.target.value)} className="text-xs px-2 py-1 rounded border border-line bg-paper text-ink focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer" defaultValue="">
          <option value="" disabled>Size</option>
          {FONT_SIZE_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
        </select>
        <span className="w-px h-5 bg-line mx-1.5" />
        <button type="button" onClick={() => execCommand('insertUnorderedList')} className={`p-1.5 rounded hover:bg-line/50 ${activeFormats.has('ul') ? 'bg-line/60 text-ink' : 'text-muted'}`} title="Bullet List"><List className="w-[18px] h-[18px]" /></button>
        <button type="button" onClick={() => execCommand('insertOrderedList')} className={`p-1.5 rounded hover:bg-line/50 ${activeFormats.has('ol') ? 'bg-line/60 text-ink' : 'text-muted'}`} title="Numbered List"><ListOrdered className="w-[18px] h-[18px]" /></button>
        <button type="button" onClick={() => execCommand('formatBlock', 'blockquote')} className={`p-1.5 rounded hover:bg-line/50 ${currentHeading === 'blockquote' ? 'bg-line/60 text-ink' : 'text-muted'}`} title="Quote"><Quote className="w-[18px] h-[18px]" /></button>
        <span className="w-px h-5 bg-line mx-1.5" />
        <button type="button" onClick={() => execCommand('outdent')} className="p-1.5 rounded hover:bg-line/50 text-muted" title="Decrease indent"><span className="text-xs font-bold">←</span></button>
        <button type="button" onClick={() => execCommand('indent')} className="p-1.5 rounded hover:bg-line/50 text-muted" title="Increase indent"><span className="text-xs font-bold">→</span></button>
        <span className="w-px h-5 bg-line mx-1.5" />
        <button type="button" onClick={() => execCommand('justifyLeft')} className="p-1.5 rounded hover:bg-line/50 text-muted" title="Align left"><span className="text-xs font-bold">⫷</span></button>
        <button type="button" onClick={() => execCommand('justifyCenter')} className="p-1.5 rounded hover:bg-line/50 text-muted" title="Center"><span className="text-xs font-bold">≡</span></button>
        <button type="button" onClick={() => execCommand('justifyRight')} className="p-1.5 rounded hover:bg-line/50 text-muted" title="Align right"><span className="text-xs font-bold">⫸</span></button>
        <span className="w-px h-5 bg-line mx-1.5" />
        <button type="button" onClick={() => setShowTableModal(true)} className="p-1.5 rounded hover:bg-line/50 text-muted" title="Insert Table"><Table className="w-[18px] h-[18px]" /></button>
        <label className={`p-1.5 rounded hover:bg-line/50 text-muted cursor-pointer ${uploadingImage ? 'opacity-50' : ''}`} title="Insert Image">
          <Image className="w-[18px] h-[18px]" />
          <input type="file" accept="image/*" onChange={insertImage} className="hidden" disabled={uploadingImage} />
        </label>
        {uploadingImage && <span className="text-[10px] text-accent ml-1">Uploading...</span>}
      </div>

      <div className="relative">
        {showPlaceholder && (
          <div className="absolute top-0 left-0 p-4 text-muted pointer-events-none text-sm leading-relaxed select-none">
            Start writing your report here... Use the toolbar above to format text, insert tables, and add charts.
          </div>
        )}
        <div ref={editorRef} contentEditable suppressContentEditableWarning
          className="min-h-[500px] p-4 focus:outline-none prose prose-ink max-w-none text-sm leading-relaxed"
          onInput={handleInput} onMouseUp={handleSelect} onKeyUp={handleSelect}
        />
      </div>

      {showTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowTableModal(false)}>
          <div className="bg-panel rounded-xl border border-line p-6 w-full max-w-sm mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-ink">Insert Table</h3>
              <button onClick={() => setShowTableModal(false)} className="text-muted hover:text-ink"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Rows</label>
                <input type="number" min={1} max={20} value={tableRows} onChange={(e) => setTableRows(Number(e.target.value))} className="w-full px-3 py-2 border border-line rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Columns</label>
                <input type="number" min={1} max={20} value={tableCols} onChange={(e) => setTableCols(Number(e.target.value))} className="w-full px-3 py-2 border border-line rounded-lg text-sm" />
              </div>
            </div>
            <div className="mb-4 overflow-hidden rounded-lg border border-line">
              <table className="w-full" style={{ tableLayout: 'fixed' }}>
                <tbody>
                  {Array.from({ length: Math.min(tableRows, 6) }).map((_, r) => (
                    <tr key={r}>
                      {Array.from({ length: Math.min(tableCols, 6) }).map((_, c) => (
                        <td key={c} className="border border-line p-1.5" style={{ backgroundColor: r < Math.min(tableRows, 6) && c < Math.min(tableCols, 6) ? '#FFF7F3' : 'transparent' }} />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-muted mb-3 text-center">{tableRows} × {tableCols}</p>
            <button onClick={insertTable} className="w-full px-4 py-2 bg-ink text-paper rounded-lg font-bold text-sm hover:bg-ink/90 transition-colors">Insert Table</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Types ──────────────────────────────────────────────────────────────────

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

// ─── Edit Page ──────────────────────────────────────────────────────────────

export default function EditReportPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [meta, setMeta] = useState<ReportMeta | null>(null)
  const [existingPdfUrl, setExistingPdfUrl] = useState<string | null>(null)
  const [newPdfFile, setNewPdfFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (!profile || profile.role !== 'admin') { router.push('/'); return }

      const { data: post, error } = await supabase
        .from('research_posts')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error || !post) {
        setError('Report not found')
        setFetching(false)
        return
      }

      setTitle(post.title)
      setContent(post.content)
      setExistingPdfUrl(post.pdf_url)
      setMeta(post.report_meta || {
        ticker: '', sector: '', valuation_date: '', tagline: '', rating: 'HOLD',
        tp_range: '', weighted_avg_tp: '', cmp: '', implied_upside: '',
        horizon: '12-18 months', risk_level: 'Medium',
        market_cap: '', high_52w: '', low_52w: '', shares_outstanding: '',
        pe_ratio: '', ev_ebitda: '', dividend_yield: '', roce_roe: '', nse_bse: '',
      })
      setFetching(false)
    }
    fetchPost()
  }, [params.id, supabase, router])

  const updateMeta = (key: keyof ReportMeta, value: string) => {
    setMeta((prev) => prev ? { ...prev, [key]: value } : prev)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Unauthorized.')

      let pdf_url = existingPdfUrl
      if (newPdfFile) {
        const ext = newPdfFile.name.split('.').pop()
        const fileName = `reports/${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`
        const { error: uploadError } = await supabase.storage.from('research-pdfs').upload(fileName, newPdfFile)
        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabase.storage.from('research-pdfs').getPublicUrl(fileName)
        pdf_url = publicUrl
      }

      if (!meta) throw new Error('Metadata is missing')

      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = content
      const excerpt = meta?.tagline || tempDiv.textContent?.substring(0, 200) || ''

      console.log('Saving...', { id: params.id, title: title?.substring(0, 30), contentLength: content?.length })











      // Use API route (server-side) to bypass RLS restrictions
      const response = await fetch('/api/admin/update-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: params.id,
          title,
          content,
          excerpt,
          pdf_url: existingPdfUrl,
          report_meta: meta,
        }),
      })






      const result = await response.json()






      if (!response.ok) {
        throw new Error(result.error || `Server error (${response.status})`)
      }




      console.log('Update result:', result)

      setSuccess(true)
      setTimeout(() => { router.push(`/research/${params.id}`); router.refresh() }, 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-muted">Loading report...</p>
      </div>
    )
  }

  if (error && !meta) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8 text-center">
        <h1 className="text-2xl font-bold text-ink">Report not found</h1>
        <Link href="/admin/dashboard" className="text-muted hover:text-ink mt-4 inline-block">Back to dashboard</Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink">Edit Report</h1>
        <p className="text-muted mt-1">Update the research report and its metadata</p>
      </div>

      {success ? (
        <div className="bg-positive/10 border border-positive/20 rounded-lg p-6 text-center">
          <Send className="w-12 h-12 text-positive mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-positive mb-2">Updated Successfully!</h2>
          <p className="text-positive">Redirecting to report...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-8">
          {/* Section 1: Basic Info */}
          <div className="bg-panel border border-line rounded-lg p-6">
            <h2 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent" /> Report Information
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-ink mb-1">Report Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  required />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">NSE Ticker</label>
                <input type="text" value={meta?.ticker || ''} onChange={(e) => updateMeta('ticker', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Sector</label>
                <input type="text" value={meta?.sector || ''} onChange={(e) => updateMeta('sector', e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-ink mb-1">Valuation Date</label>
                <input type="date" value={meta?.valuation_date || ''} onChange={(e) => updateMeta('valuation_date', e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-ink mb-1">Tagline / Investment Thesis</label>
                <textarea value={meta?.tagline || ''} onChange={(e) => updateMeta('tagline', e.target.value)} rows={2}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none" />
              </div>
            </div>
          </div>

          {/* Section 2: Rating & Valuation */}
          <div className="bg-panel border border-line rounded-lg p-6">
            <h2 className="text-lg font-bold text-ink mb-4">Rating &amp; Valuation</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Rating</label>
                <select value={meta?.rating || 'HOLD'} onChange={(e) => updateMeta('rating', e.target.value)}
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
                <input type="text" value={meta?.tp_range || ''} onChange={(e) => updateMeta('tp_range', e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Weighted Avg. TP</label>
                <input type="text" value={meta?.weighted_avg_tp || ''} onChange={(e) => updateMeta('weighted_avg_tp', e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">CMP</label>
                <input type="text" value={meta?.cmp || ''} onChange={(e) => updateMeta('cmp', e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Implied Upside/Downside</label>
                <input type="text" value={meta?.implied_upside || ''} onChange={(e) => updateMeta('implied_upside', e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Investment Horizon</label>
                <input type="text" value={meta?.horizon || ''} onChange={(e) => updateMeta('horizon', e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Risk Level</label>
                <select value={meta?.risk_level || 'Medium'} onChange={(e) => updateMeta('risk_level', e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Company Snapshot */}
          <div className="bg-panel border border-line rounded-lg p-6">
            <h2 className="text-lg font-bold text-ink mb-4">Company Snapshot</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Market Cap</label>
                <input type="text" value={meta?.market_cap || ''} onChange={(e) => updateMeta('market_cap', e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">52Wk High</label>
                <input type="text" value={meta?.high_52w || ''} onChange={(e) => updateMeta('high_52w', e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">52Wk Low</label>
                <input type="text" value={meta?.low_52w || ''} onChange={(e) => updateMeta('low_52w', e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Shares Outstanding</label>
                <input type="text" value={meta?.shares_outstanding || ''} onChange={(e) => updateMeta('shares_outstanding', e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">P/E Ratio</label>
                <input type="text" value={meta?.pe_ratio || ''} onChange={(e) => updateMeta('pe_ratio', e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">EV/EBITDA</label>
                <input type="text" value={meta?.ev_ebitda || ''} onChange={(e) => updateMeta('ev_ebitda', e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Dividend Yield</label>
                <input type="text" value={meta?.dividend_yield || ''} onChange={(e) => updateMeta('dividend_yield', e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">ROCE / ROE</label>
                <input type="text" value={meta?.roce_roe || ''} onChange={(e) => updateMeta('roce_roe', e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">NSE / BSE</label>
                <input type="text" value={meta?.nse_bse || ''} onChange={(e) => updateMeta('nse_bse', e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm" />
              </div>
            </div>
          </div>

          {/* Section 4: Report Body */}
          <div className="bg-panel border border-line rounded-lg p-6">
            <h2 className="text-lg font-bold text-ink mb-4">Report Body</h2>
            <RichTextEditor content={content} onChange={setContent} />
          </div>

          {/* Section 5: PDF */}
          <div className="bg-panel border border-line rounded-lg p-6">
            <h2 className="text-lg font-bold text-ink mb-4">PDF Attachment</h2>
            {existingPdfUrl && (
              <p className="text-xs text-muted mb-3">Current PDF: <a href={existingPdfUrl} target="_blank" rel="noopener noreferrer" className="text-accent underline">View PDF</a> — Upload a new file to replace it.</p>
            )}
            <input type="file" accept=".pdf" onChange={(e) => setNewPdfFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-accent file:text-white hover:file:bg-accent/90" />
            {newPdfFile && <p className="text-xs text-muted mt-2">New file: {newPdfFile.name}</p>}
          </div>

          {error && <div className="text-sm text-negative bg-negative/10 px-3 py-2 rounded-lg">{error}</div>}

          <div className="flex items-center gap-4">
            <button type="submit" disabled={loading || !title.trim() || !content.trim()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-paper rounded-lg font-bold text-[0.95rem] hover:bg-ink/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              <Send className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <Link href="/admin/dashboard"
              className="px-6 py-3 rounded-lg border border-line text-sm font-medium text-muted hover:text-ink hover:bg-panel transition-all">
              Cancel
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}
