'use client'



import { useEffect, useState } from 'react'

import { createClient } from '@/lib/supabase/client'

import { useParams } from 'next/navigation'

import { Calendar, Eye, Download, ArrowLeft, FileText, Pencil } from 'lucide-react'
import Link from 'next/link'

export default function SingleResearchPage() {
  const params = useParams()

  const supabase = createClient()

  const [post, setPost] = useState<any>(null)

  const [loading, setLoading] = useState(true)

  const [comments, setComments] = useState<any[]>([])

  const [newComment, setNewComment] = useState('')

  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [liveCmp, setLiveCmp] = useState<number | null>(null)
  const [marketState, setMarketState] = useState<string>('CLOSED')



  useEffect(() => {

    const fetchData = async () => {

      const { data: { user } } = await supabase.auth.getUser()

      setUser(user)

      // Check admin role
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        setIsAdmin(profile?.role === 'admin')
      }



      const { data: post } = await supabase

        .from('research_posts')

        .select('*')

        .eq('id', params.id)

        .single()

      setPost(post)



      if (post) {

        await supabase

          .from('research_posts')

          .update({ views: (post.views || 0) + 1 })

          .eq('id', params.id)

        // Fetch live CMP if ticker is available
        const ticker = post.report_meta?.ticker
        if (ticker) {
          try {
            const priceRes = await fetch(`/api/stock-price/${ticker}`)
            if (priceRes.ok) {
              const priceData = await priceRes.json()
              setLiveCmp(priceData.price)
              setMarketState(priceData.marketState)
            }
          } catch {
            // silently fall back to stored CMP
          }
        }

      }



      const { data: comments } = await supabase

        .from('comments')

        .select('*, profiles(email)')

        .eq('post_id', params.id)

        .order('created_at', { ascending: true })

      setComments(comments || [])



      setLoading(false)

    }



    fetchData()

  }, [params.id, supabase])



  const handleComment = async (e: React.FormEvent) => {

    e.preventDefault()

    if (!user || !newComment.trim()) return



    const { error } = await supabase

      .from('comments')

      .insert({

        post_id: params.id,

        user_id: user.id,

        content: newComment.trim(),

      })



    if (!error) {

      const { data: comments } = await supabase

        .from('comments')

        .select('*, profiles(email)')

        .eq('post_id', params.id)

        .order('created_at', { ascending: true })

      setComments(comments || [])

      setNewComment('')

    }

  }



  if (loading) {

    return (

      <div className="flex items-center justify-center min-h-[50vh]">

        <div className="animate-pulse text-muted">Loading...</div>

      </div>

    )

  }



  if (!post) {

    return (

      <div className="max-w-3xl mx-auto px-4 py-12 text-center">

                <h1 className="text-2xl font-bold text-ink">Report not found</h1>

        <Link href="/research" className="text-muted hover:text-ink mt-4 inline-block">

          Back to research

        </Link>

      </div>

    )

  }



        const m: any = post.report_meta || {}

    return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/research"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Research
        </Link>

        {isAdmin && (
          <Link
            href={`/admin/edit/${params.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:text-accent transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit Report
          </Link>
        )}
      </div>

      {/* ════════════════════════════════════════════════
          REPORT COVER
         ════════════════════════════════════════════════ */}
      <section className="
                        mb-12 
                        rounded-2x1 
                        border border-line 
                        bg-panel 
                        p-8 md:p-12 
                        shadow-sm">
        <div className="flex flex-wrap
                        gap-x-8 gap-y-2
                        pb-6
                        border-b border-line
                        text-xs
                        font-semibold
                        tracking-[0.08em]
                        uppercase
                        text-muted
                        mb-8">
          <span>Aadith Santosh Equity Research</span>
          {m.ticker && <span>NSE: <strong className="text-ink">{m.ticker}</strong></span>}
          {m.sector && <span>Sector: <strong className="text-ink">{m.sector}</strong></span>}
          {m.valuation_date && <span>Published: <strong className="text-ink">{m.valuation_date}</strong></span>}
        </div>

        <div className="mb-8">
          {m.sector && (
            <p className="text-xs text-muted font-extrabold tracking-[0.1em] uppercase mb-3">
              Valuation Report{m.sector ? ` · ${m.sector}` : ''}{m.rating === 'HOLD' ? ' · Large Cap' : ''}
            </p>
          )}
          <h1 className="text-4xl
                        md:text-5xl
                        font-extrabold
                        text-ink
                        leading-tight
                        mb-4">
            {post.title}
          </h1>
          {m.tagline && (
            <p className="text-lg
                          text-muted
                          max-w-3xl
                          leading-relaxed">
              {m.tagline}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 mt-5">
                        {m.rating && (() => {
              const ratingClass = ({
                BUY: 'bg-positive/15 text-positive',
                ACCUMULATE: 'bg-positive/15 text-positive',
                HOLD: 'bg-caution/15 text-caution',
                SELL: 'bg-negative/15 text-negative',
                'UNDER REVIEW': 'bg-muted/15 text-muted',
              } as Record<string, string>)[m.rating] || 'bg-muted/15 text-muted'
              return (
                <span className={`inline-flex items-center justify-center min-w-[68px] min-h-[30px] px-[10px] py-[4px] rounded-full text-[0.76rem] font-black tracking-[0.08em] uppercase ${ratingClass}`}>{m.rating}</span>
              )
            })()}
            {m.ticker && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-line/30 text-muted text-[0.72rem] font-semibold tracking-wide">
                {m.ticker}{m.sector ? ` · ${m.sector}` : ''}
              </span>
            )}
            {m.nse_bse && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-line/30 text-muted text-[0.72rem] font-semibold tracking-wide">
                {m.nse_bse}
              </span>
            )}
            {post.pdf_url && (
              <a href={post.pdf_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-line/30 text-ink text-[0.72rem] font-semibold tracking-wide hover:bg-line/50 transition-colors">
                <Download className="w-3 h-3" />
                Download PDF
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          VALUATION FACTS GRID
         ════════════════════════════════════════════════ */}
      {[m.tp_range, m.weighted_avg_tp, m.cmp, m.implied_upside, m.horizon, m.risk_level].some(Boolean) && (
        <section className="mb-10">
          <div className="grid
                          md:grid-cols-3
                          xl:grid-cols-6
                          gap-4">
            {[
              { label: 'TP Range', value: m.tp_range },
              { label: 'Weighted Avg. TP', value: m.weighted_avg_tp },
              { label: 'CMP', value: m.cmp, live: true },
              { label: 'Implied Upside / Downside', value: m.implied_upside },
              { label: 'Investment Horizon', value: m.horizon },
              { label: 'Risk Level', value: m.risk_level },
            ].filter(d => d.value || d.live).map((d, i) => (
              <div key={i} className="rounded-xl border border-line bg-panel p-5 shadow-sm">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs text-muted">{d.label}</span>
                  {d.live && liveCmp && (
                    <span className="inline-flex items-center gap-1 text-[0.65rem] font-bold text-positive">
                      <span className={`w-1.5 h-1.5 rounded-full bg-positive ${marketState === 'REGULAR' ? 'animate-pulse' : ''}`} />
                      {marketState === 'REGULAR' ? 'Live' : 'Last'}
                    </span>
                  )}
                </div>
                <strong className="block text-sm text-ink">
                  {d.live && liveCmp
                    ? `₹${liveCmp.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : d.value}
                </strong>
                {d.live && liveCmp && m.cmp && (
                  <span className="block text-[0.7rem] text-muted mt-0.5">
                    at pub: {m.cmp}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════
          COMPANY SNAPSHOT
         ════════════════════════════════════════════════ */}
      {[m.market_cap, m.high_52w, m.low_52w, m.shares_outstanding, m.pe_ratio, m.ev_ebitda, m.dividend_yield, m.roce_roe, m.nse_bse].some(Boolean) && (
        <section className="mb-10">
          <h2 className="text-lg
                        font-bold
                        text-ink
                        mb-4">Company Snapshot</h2>
          <div className="overflow-x-auto
                          rounded-2xl
                          border border-line
                          bg-white
                          shadow-sm">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-panel">
                  {[
                    'Market Cap.', '52Wk High/Low', 'Shares O/S', 'P/E Ratio',
                    'EV/EBITDA', 'Div. Yield', 'ROCE/ROE', 'NSE/BSE'
                  ].map(label => (
                    <th key={label} className="px-4 py-2.5 text-xs text-muted font-semibold text-left whitespace-nowrap border-b border-line">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2.5 text-ink font-bold border-b border-line whitespace-nowrap">{m.market_cap || '—'}</td>
                  <td className="px-4 py-2.5 text-ink font-bold border-b border-line whitespace-nowrap">{[m.high_52w, m.low_52w].filter(Boolean).join(' / ') || '—'}</td>
                  <td className="px-4 py-2.5 text-ink font-bold border-b border-line whitespace-nowrap">{m.shares_outstanding || '—'}</td>
                  <td className="px-4 py-2.5 text-ink font-bold border-b border-line whitespace-nowrap">{m.pe_ratio || '—'}</td>
                  <td className="px-4 py-2.5 text-ink font-bold border-b border-line whitespace-nowrap">{m.ev_ebitda || '—'}</td>
                  <td className="px-4 py-2.5 text-ink font-bold border-b border-line whitespace-nowrap">{m.dividend_yield || '—'}</td>
                  <td className="px-4 py-2.5 text-ink font-bold border-b border-line whitespace-nowrap">{m.roce_roe || '—'}</td>
                  <td className="px-4 py-2.5 text-ink font-bold border-b border-line whitespace-nowrap">{m.nse_bse || '—'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════
          REPORT BODY
         ════════════════════════════════════════════════ */}
      <article>
        <div className="flex items-center gap-4 text-xs text-muted mb-6">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(post.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {post.views || 0} views
          </span>
        </div>

        <div className="prose
                        prose-lg
                        max-w-none

                        prose-headings:text-ink
                        prose-headings:font-bold

                        prose-h2:text-3xl
                        prose-h2:mt-16
                        prose-h2:mb-6

                        prose-h3:text-2xl
                        prose-h3:mt-12
                        prose-h3:mb-5

                        prose-p:text-[1rem]
                        prose-p:leading-8
                        prose-p:text-[#3A3A3A]

                        prose-li:leading-8
                        prose-li:text-[#3A3A3A]

                        prose-table:w-full
                        prose-table:border-collapse

                        prose-th:bg-panel
                        prose-th:px-4
                        prose-th:py-3
                        prose-th:text-xs
                        prose-th:text-muted

                        prose-td:px-4
                        prose-td:py-3

                        prose-blockquote:border-l-4
                        prose-blockquote:border-accent
                        prose-blockquote:pl-4
        ">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
      </article>

      {/* ════════════════════════════════════════════════
          PDF DOWNLOAD PANEL
         ════════════════════════════════════════════════ */}
      {post.pdf_url && (
        <section className="mt-14
                            p-8
                            rounded-2xl
                            border border-line
                            bg-gradient-to-r
                            from-panel
                            to-panel/70
                            flex flex-col
                            sm:flex-row
                            items-start
                            sm:items-center
                            justify-between
                            gap-4">
          <div>
            <h2 className="text-sm font-bold text-ink">PDF Version</h2>
            <p className="text-xs text-muted mt-1">The full report is available as a downloadable PDF.</p>
          </div>
          <a href={post.pdf_url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-ink text-paper text-sm font-bold hover:bg-ink/90 transition-colors whitespace-nowrap">
            <Download className="w-4 h-4" />
            Download PDF
          </a>
        </section>
      )}

      {/* ════════════════════════════════════════════════
          DISCLAIMER
         ════════════════════════════════════════════════ */}
      <section className="mt-10
                          p-6
                          rounded-2xl
                          border border-line
                          bg-panel">
        <h2 className="text-xs font-bold text-ink uppercase tracking-wide mb-2">Disclaimer</h2>
        <p className="text-xs text-muted leading-relaxed">
          This report has been prepared for informational and academic purposes only and does not constitute investment advice, an offer to buy or sell securities, or a recommendation to take any investment action. The analysis is based on publicly available information, financial data, management commentary, and valuation assumptions that may not fully reflect future business performance or market conditions. While reasonable care has been taken in preparing this report, no assurance is given regarding the accuracy, completeness, or reliability of the information presented. Actual outcomes may differ materially from estimates and projections due to changes in macroeconomic conditions, industry trends, company performance, regulatory developments, or other unforeseen factors. Readers should conduct their own independent analysis and due diligence before making any investment decision.
        </p>
      </section>

      {/* ════════════════════════════════════════════════
          COMMENTS
         ════════════════════════════════════════════════ */}
      <section className="mt-16 pt-10 border-t border-line">
        <h2 className="text-xl font-semibold text-ink mb-6">
          Comments ({comments.length})
        </h2>

        {user ? (
          <form onSubmit={handleComment} className="mb-8">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              rows={3}
              className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
            />
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Post Comment
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-8 p-4 bg-zinc-50 rounded-lg text-center">
            <p className="text-sm text-zinc-500">
              <Link href="/login" className="text-zinc-900 font-medium hover:underline">
                Sign in
              </Link>{' '}
              to leave a comment
            </p>
          </div>
        )}

        <div className="space-y-4">
          {comments.map((comment: any) => (
            <div key={comment.id} className="p-4 bg-white rounded-lg border border-zinc-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-900">
                  {comment.profiles?.email?.split('@')[0] || 'Anonymous'}
                </span>
                <span className="text-xs text-zinc-400">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-zinc-600">{comment.content}</p>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-center text-sm text-zinc-400 py-8">
              No comments yet. Start the discussion!
            </p>
          )}
        </div>
      </section>
    </div>
  )
}



