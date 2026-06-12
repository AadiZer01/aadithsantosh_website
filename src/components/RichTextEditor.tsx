'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Bold, Italic, List, ListOrdered, Quote,
  Undo, Redo, Table, Image, X,
} from 'lucide-react'

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

export default function RichTextEditor({
  content,
  onChange,
}: {
  content: string
  onChange: (html: string) => void
}) {
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
    const val = document.queryCommandValue('formatBlock').toLowerCase()
    if (['h2', 'h3', 'h4', 'blockquote'].includes(val)) heading = val
    setCurrentHeading(heading)
  }, [])

  const execCommand = useCallback(
    (command: string, value?: string) => {
      document.execCommand(command, false, value)
      if (editorRef.current) onChange(editorRef.current.innerHTML)
      updateActiveFormats()
      editorRef.current?.focus()
    },
    [onChange, updateActiveFormats]
  )

  const handleInput = useCallback(() => {
    if (editorRef.current) onChange(editorRef.current.innerHTML)
  }, [onChange])

  const handleSelect = useCallback(() => {
    updateActiveFormats()
  }, [updateActiveFormats])

  // Only set innerHTML on initial mount
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (editorRef.current && !ready) {
      editorRef.current.innerHTML = content
      setReady(true)
    }
  }, [content, ready])

  // Tab key: indent list items, insert tab otherwise
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault()
        if (activeFormats.has('ul') || activeFormats.has('ol')) {
          execCommand(e.shiftKey ? 'outdent' : 'indent')
        } else {
          document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;')
          if (editorRef.current) onChange(editorRef.current.innerHTML)
        }
      }
    },
    [activeFormats, execCommand, onChange]
  )

  const insertTable = () => {
    let html = '<table style="width:100%;border-collapse:collapse;margin:1rem 0;">\n'
    for (let r = 0; r < tableRows; r++) {
      html += '  <tr>\n'
      for (let c = 0; c < tableCols; c++) {
        const isHeader = r === 0
        const tag = isHeader ? 'th' : 'td'
        const style = `border:1px solid #D8CFCB;padding:8px 12px;text-align:left;${isHeader ? 'background:#FFF7F3;font-weight:700;' : ''}`
        html += `    <${tag} style="${style}">${isHeader ? `Header ${c + 1}` : ''}</${tag}>\n`
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
      const { error: uploadError } = await supabase.storage
        .from('report-images')
        .upload(fileName, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage
        .from('report-images')
        .getPublicUrl(fileName)
      document.execCommand(
        'insertHTML',
        false,
        `<img src="${publicUrl}" alt="chart" style="max-width:100%;margin:1rem 0;border-radius:8px;" />`
      )
      if (editorRef.current) onChange(editorRef.current.innerHTML)
    } catch (err: any) {
      alert('Failed to upload image: ' + err.message)
    } finally {
      setUploadingImage(false)
      e.target.value = ''
    }
  }

  const btn = (active: boolean) =>
    `p-1.5 rounded hover:bg-line/50 transition-colors ${active ? 'bg-line/70 text-ink' : 'text-muted'}`

  return (
    <div className="border border-line rounded-lg overflow-hidden shadow-sm bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 border-b border-line bg-paper select-none sticky top-0 z-10">

        <button type="button" onClick={() => execCommand('undo')} className={btn(false)} title="Undo (Ctrl+Z)"><Undo className="w-[18px] h-[18px]" /></button>
        <button type="button" onClick={() => execCommand('redo')} className={btn(false)} title="Redo (Ctrl+Y)"><Redo className="w-[18px] h-[18px]" /></button>
        <span className="w-px h-5 bg-line mx-1" />

        <button type="button" onClick={() => execCommand('bold')} className={btn(activeFormats.has('bold'))} title="Bold (Ctrl+B)"><Bold className="w-[18px] h-[18px]" /></button>
        <button type="button" onClick={() => execCommand('italic')} className={btn(activeFormats.has('italic'))} title="Italic (Ctrl+I)"><Italic className="w-[18px] h-[18px]" /></button>
        <button type="button" onClick={() => execCommand('underline')} className={btn(activeFormats.has('underline'))} title="Underline (Ctrl+U)">
          <span className="text-sm font-bold leading-none" style={{ textDecoration: 'underline' }}>U</span>
        </button>
        <button type="button" onClick={() => execCommand('strikeThrough')} className={btn(activeFormats.has('strike'))} title="Strikethrough">
          <span className="text-sm font-bold leading-none" style={{ textDecoration: 'line-through' }}>S</span>
        </button>
        <span className="w-px h-5 bg-line mx-1" />

        <select
          value={currentHeading}
          onChange={(e) => execCommand('formatBlock', e.target.value)}
          className="text-xs px-2 py-1 rounded border border-line bg-paper text-ink focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
        >
          {HEADING_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <select
          onChange={(e) => execCommand('fontSize', e.target.value)}
          className="text-xs px-2 py-1 rounded border border-line bg-paper text-ink focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
          defaultValue=""
        >
          <option value="" disabled>Size</option>
          {FONT_SIZE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <span className="w-px h-5 bg-line mx-1" />

        <button type="button" onClick={() => execCommand('insertUnorderedList')} className={btn(activeFormats.has('ul'))} title="Bullet List (Tab to indent)"><List className="w-[18px] h-[18px]" /></button>
        <button type="button" onClick={() => execCommand('insertOrderedList')} className={btn(activeFormats.has('ol'))} title="Numbered List (Tab to indent)"><ListOrdered className="w-[18px] h-[18px]" /></button>
        <button type="button" onClick={() => execCommand('formatBlock', 'blockquote')} className={btn(currentHeading === 'blockquote')} title="Quote"><Quote className="w-[18px] h-[18px]" /></button>
        <span className="w-px h-5 bg-line mx-1" />

        <button type="button" onClick={() => execCommand('outdent')} className={btn(false)} title="Decrease indent (Shift+Tab in list)"><span className="text-xs font-bold">←</span></button>
        <button type="button" onClick={() => execCommand('indent')} className={btn(false)} title="Increase indent (Tab in list)"><span className="text-xs font-bold">→</span></button>
        <span className="w-px h-5 bg-line mx-1" />

        <button type="button" onClick={() => execCommand('justifyLeft')} className={btn(false)} title="Align left"><span className="text-xs font-bold">⫷</span></button>
        <button type="button" onClick={() => execCommand('justifyCenter')} className={btn(false)} title="Center"><span className="text-xs font-bold">≡</span></button>
        <button type="button" onClick={() => execCommand('justifyRight')} className={btn(false)} title="Align right"><span className="text-xs font-bold">⫸</span></button>
        <span className="w-px h-5 bg-line mx-1" />

        <button type="button" onClick={() => setShowTableModal(true)} className={btn(false)} title="Insert Table"><Table className="w-[18px] h-[18px]" /></button>
        <label className={`p-1.5 rounded hover:bg-line/50 text-muted cursor-pointer transition-colors ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`} title="Insert Image">
          <Image className="w-[18px] h-[18px]" />
          <input type="file" accept="image/*" onChange={insertImage} className="hidden" disabled={uploadingImage} />
        </label>
        {uploadingImage && <span className="text-[10px] text-accent ml-1 animate-pulse">Uploading…</span>}
      </div>

      {/* Editor area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="rich-editor min-h-[500px] p-5 focus:outline-none text-sm leading-relaxed text-ink"
        onInput={handleInput}
        onMouseUp={handleSelect}
        onKeyUp={handleSelect}
        onKeyDown={handleKeyDown}
        data-placeholder="Start writing your report… Use the toolbar above to format text, insert tables, and add charts."
      />

      {/* Table modal */}
      {showTableModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => setShowTableModal(false)}
        >
          <div
            className="bg-panel rounded-xl border border-line p-6 w-full max-w-sm mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
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
                        <td key={c} className="border border-line p-1.5 bg-paper" />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-muted mb-3 text-center">{tableRows} × {tableCols}</p>
            <button
              onClick={insertTable}
              className="w-full px-4 py-2 bg-ink text-paper rounded-lg font-bold text-sm hover:bg-ink/90 transition-colors"
            >
              Insert Table
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
