import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Calendar, Pencil, X } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Insights',
  description: 'Short-form market commentary, sector observations, and valuation thinking — published between full research reports.',
  openGraph: {
    title: 'Insights — Aadith Santosh',
    description: 'Short-form market commentary, sector observations, and valuation thinking — published between full research reports.',
  },
}

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>
}) {
  const { tag } = await searchParams
  const supabase = await createClient()

  let query = supabase.from('insights').select('*').order('created_at', { ascending: false })
  if (tag) query = query.contains('tags', [tag])

  const { data: insights } = await query

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-[54px] pb-[86px]">

      <section className="pb-[38px] border-b border-line max-w-[760px]">
        <p className="text-accent font-extrabold text-xs tracking-[0.08em] uppercase mb-4">
          Insights
        </p>
        <div className="w-10 h-[3px] bg-accent rounded-full mb-5" />
        <h1 className="text-h1 font-bold text-ink leading-[1.1] tracking-tight mb-5">
          Market observations, sector notes, and valuation thinking.
        </h1>
        <p className="text-lg text-[#34445e] leading-relaxed">
          Short-form commentary on companies, sectors, and ideas I am actively following — published between full research reports.
        </p>
      </section>

      <section className="mt-[42px]">
        {tag && (
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-muted">Filtered by:</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-accent bg-accent/8 px-2.5 py-1 rounded-full">
              {tag}
              <Link href="/insights" aria-label="Clear filter">
                <X className="w-3 h-3 hover:text-negative transition-colors" />
              </Link>
            </span>
          </div>
        )}

        {!insights || insights.length === 0 ? (
          <div className="text-center py-24">
            <Pencil className="w-10 h-10 text-line mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-muted">
              {tag ? `No insights tagged "${tag}"` : 'Nothing published yet'}
            </h2>
            {tag ? (
              <Link href="/insights" className="text-accent text-sm mt-2 inline-block hover:underline">
                View all insights
              </Link>
            ) : (
              <p className="text-muted text-sm mt-2">Insights will appear here as they are written.</p>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {insights.map((insight: any) => {
              const plainText = insight.body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
              const excerpt = plainText.length > 180
                ? plainText.slice(0, 180).trimEnd() + '…'
                : plainText

              return (
                <div
                  key={insight.id}
                  className="relative bg-panel border border-line rounded-xl p-6 hover:border-accent/40 transition-colors group"
                >
                  <Link href={`/insights/${insight.id}`} className="absolute inset-0 rounded-xl" aria-label={insight.title} />
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {insight.tags?.map((t: string) => (
                      <Link
                        key={t}
                        href={`/insights?tag=${encodeURIComponent(t)}`}
                        className={`relative z-10 text-xs font-bold uppercase tracking-[0.06em] px-2 py-0.5 rounded transition-colors ${
                          t === tag
                            ? 'bg-accent text-paper'
                            : 'text-accent bg-accent/8 hover:bg-accent hover:text-paper'
                        }`}
                      >
                        {t}
                      </Link>
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
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
