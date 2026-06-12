import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { FileText, Calendar, Eye } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Research Reports',
  description: 'Independent equity research reports on Indian listed companies. In-depth valuation analysis covering business quality, financial durability, and 12–18 month investment views.',
  openGraph: {
    title: 'Research Reports — Aadith Santosh',
    description: 'Independent equity research reports on Indian listed companies. In-depth valuation analysis covering business quality, financial durability, and 12–18 month investment views.',
  },
}

const RATING_STYLES: Record<string, string> = {
  BUY:          'bg-positive/12 text-positive',
  ACCUMULATE:   'bg-positive/12 text-positive',
  HOLD:         'bg-caution/12 text-caution',
  SELL:         'bg-negative/12 text-negative',
  'UNDER REVIEW': 'bg-muted/12 text-muted',
}

export default async function ResearchPage() {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('research_posts')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-[54px] pb-[86px]">

      {/* Hero */}
      <section className="pb-[38px] border-b border-line max-w-[760px]">
        <p className="text-accent font-extrabold text-[0.78rem] tracking-[0.08em] uppercase mb-4">
          Research
        </p>
        <div className="w-10 h-[3px] bg-accent rounded-full mb-5" />
        <h1 className="text-[clamp(1.9rem,3.5vw,2.8rem)] font-bold text-ink leading-[1.1] tracking-tight mb-5">
          Independent equity research on Indian listed companies.
        </h1>
        <p className="text-[clamp(1rem,1.5vw,1.15rem)] text-[#34445e] leading-relaxed">
          In-depth valuation reports covering business quality, financial durability, and 12–18 month investment views.
        </p>
      </section>

      {/* List */}
      <section className="mt-[42px]">
        {!posts || posts.length === 0 ? (
          <div className="text-center py-24">
            <FileText className="w-10 h-10 text-line mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-muted">No reports yet</h2>
            <p className="text-muted text-sm mt-2">New research will appear here once published.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {posts.map((post: any) => {
              const m = post.report_meta || {}
              const ratingStyle = RATING_STYLES[m.rating] ?? 'bg-muted/12 text-muted'

              return (
                <Link
                  key={post.id}
                  href={`/research/${post.id}`}
                  className="block bg-panel border border-line rounded-xl p-6 hover:border-accent/40 transition-colors group"
                >
                  {/* Top row — ticker, sector, rating */}
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    {m.ticker && (
                      <span className="text-[0.72rem] font-extrabold tracking-[0.06em] text-ink bg-line/40 px-2 py-0.5 rounded">
                        {m.ticker}
                      </span>
                    )}
                    {m.sector && (
                      <span className="text-[0.72rem] font-semibold text-muted">
                        {m.sector}
                      </span>
                    )}
                    {m.rating && (
                      <span className={`ml-auto text-[0.72rem] font-black uppercase tracking-[0.06em] px-2.5 py-0.5 rounded-full ${ratingStyle}`}>
                        {m.rating}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="text-[1.1rem] font-bold text-ink mb-2 group-hover:text-accent transition-colors leading-snug">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-muted text-sm leading-relaxed line-clamp-2 mb-4">
                    {m.tagline || post.excerpt || 'Click to read the full report.'}
                  </p>

                  {/* Bottom row — TP, date, views */}
                  <div className="flex items-center gap-4 text-xs text-muted flex-wrap">
                    {m.tp_range && (
                      <span className="font-semibold text-ink">
                        TP: {m.tp_range}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(post.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    {post.views > 0 && (
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {post.views} views
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
