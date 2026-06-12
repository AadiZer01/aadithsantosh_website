import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Calendar, Pencil } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Insights',
  description: 'Short-form market commentary, sector observations, and valuation thinking — published between full research reports.',
  openGraph: {
    title: 'Insights — Aadith Santosh',
    description: 'Short-form market commentary, sector observations, and valuation thinking — published between full research reports.',
  },
}

export default async function InsightsPage() {
  const supabase = await createClient()
  const { data: insights } = await supabase
    .from('insights')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-[54px] pb-[86px]">

      <section className="pb-[38px] border-b border-line max-w-[760px]">
        <p className="text-accent font-extrabold text-[0.78rem] tracking-[0.08em] uppercase mb-4">
          Insights
        </p>
        <div className="w-10 h-[3px] bg-accent rounded-full mb-5" />
        <h1 className="text-[clamp(1.9rem,3.5vw,2.8rem)] font-bold text-ink leading-[1.1] tracking-tight mb-5">
          Market observations, sector notes, and valuation thinking.
        </h1>
        <p className="text-[clamp(1rem,1.5vw,1.15rem)] text-[#34445e] leading-relaxed">
          Short-form commentary on companies, sectors, and ideas I am actively following — published between full research reports.
        </p>
      </section>

      <section className="mt-[42px]">
        {!insights || insights.length === 0 ? (
          <div className="text-center py-24">
            <Pencil className="w-10 h-10 text-line mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-muted">Nothing published yet</h2>
            <p className="text-muted text-sm mt-2">Insights will appear here as they are written.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {insights.map((insight: any) => {
              const excerpt = insight.body.length > 180
                ? insight.body.slice(0, 180).trimEnd() + '…'
                : insight.body

              return (
                <Link
                  key={insight.id}
                  href={`/insights/${insight.id}`}
                  className="block bg-panel border border-line rounded-xl p-6 hover:border-accent/40 transition-colors group"
                >
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {insight.tags?.map((tag: string) => (
                      <span
                        key={tag}
                        className="text-[0.72rem] font-bold uppercase tracking-[0.06em] text-accent bg-accent/8 px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-[1.1rem] font-bold text-ink mb-2 group-hover:text-accent transition-colors">
                    {insight.title}
                  </h2>
                  <p className="text-muted text-sm leading-relaxed mb-4">
                    {excerpt}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(insight.created_at).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
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
