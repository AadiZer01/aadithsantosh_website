import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar, TrendingUp, FileText } from 'lucide-react'

const RATING_STYLES: Record<string, string> = {
  BUY:            'bg-positive/10 text-positive',
  ACCUMULATE:     'bg-accent/10 text-accent',
  HOLD:           'bg-caution/10 text-caution',
  SELL:           'bg-negative/10 text-negative',
  'UNDER REVIEW': 'bg-muted/10 text-muted',
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ ticker: string }>
}) {
  const { ticker } = await params
  const upper = ticker.toUpperCase()
  const supabase = await createClient()

  const { data: reports } = await supabase
    .from('research_posts')
    .select('id, title, created_at, excerpt, report_meta')
    .filter('report_meta->>ticker', 'eq', upper)
    .order('created_at', { ascending: false })

  if (!reports || reports.length === 0) notFound()

  const latest = reports[0]
  const m = latest.report_meta || {}

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-[54px] pb-[86px]">

      <Link
        href="/research"
        className="inline-flex items-center gap-2 text-muted text-sm hover:text-ink transition-colors mb-10"
      >
        <ArrowLeft className="w-4 h-4" />
        All Research
      </Link>

      {/* Company header */}
      <section className="pb-8 border-b border-line mb-10 max-w-[760px]">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-extrabold tracking-[0.08em] uppercase bg-ink text-paper px-3 py-1 rounded">
            {upper}
          </span>
          {m.sector && (
            <span className="text-sm text-muted font-medium">{m.sector}</span>
          )}
        </div>
        <h1 className="text-h1 font-bold text-ink leading-tight tracking-tight mb-4">
          {upper}
        </h1>
        {m.tagline && (
          <p className="text-lg text-muted leading-relaxed">{m.tagline}</p>
        )}
      </section>

      {/* Latest rating summary cards */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
        {m.rating && (
          <div className="bg-panel border border-line rounded-xl p-4">
            <p className="text-2xs font-bold uppercase tracking-widest text-muted mb-1.5">Current Rating</p>
            <span className={`text-sm font-black px-2.5 py-0.5 rounded-full ${RATING_STYLES[m.rating] || 'bg-line text-ink'}`}>
              {m.rating}
            </span>
          </div>
        )}
        {m.weighted_avg_tp && (
          <div className="bg-panel border border-line rounded-xl p-4">
            <p className="text-2xs font-bold uppercase tracking-widest text-muted mb-1.5">Target Price</p>
            <p className="text-sm font-bold text-ink">{m.weighted_avg_tp}</p>
          </div>
        )}
        {m.implied_upside && (
          <div className="bg-panel border border-line rounded-xl p-4">
            <p className="text-2xs font-bold uppercase tracking-widest text-muted mb-1.5">Implied Upside</p>
            <p className={`text-sm font-bold ${String(m.implied_upside).startsWith('+') ? 'text-positive' : 'text-negative'}`}>
              {m.implied_upside}
            </p>
          </div>
        )}
        {m.horizon && (
          <div className="bg-panel border border-line rounded-xl p-4">
            <p className="text-2xs font-bold uppercase tracking-widest text-muted mb-1.5">Horizon</p>
            <p className="text-sm font-bold text-ink">{m.horizon}</p>
          </div>
        )}
      </section>

      {/* Recommendation history table */}
      <section className="mb-12">
        <h2 className="text-base font-bold text-ink mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent" />
          Recommendation History
        </h2>
        <div className="border border-line rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-panel border-b border-line">
                <th className="text-left px-4 py-3 text-2xs font-bold text-muted uppercase tracking-wider">Date</th>
                <th className="text-left px-4 py-3 text-2xs font-bold text-muted uppercase tracking-wider">Rating</th>
                <th className="text-left px-4 py-3 text-2xs font-bold text-muted uppercase tracking-wider">Target Price</th>
                <th className="text-left px-4 py-3 text-2xs font-bold text-muted uppercase tracking-wider">CMP at Report</th>
                <th className="text-left px-4 py-3 text-2xs font-bold text-muted uppercase tracking-wider">Upside</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {reports.map((report, i) => {
                const rm = report.report_meta || {}
                const isLatest = i === 0
                const dateStr = rm.valuation_date
                  ? new Date(rm.valuation_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  : new Date(report.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

                return (
                  <tr
                    key={report.id}
                    className={`border-b border-line last:border-0 hover:bg-panel/60 transition-colors ${isLatest ? 'bg-accent/[0.03]' : ''}`}
                  >
                    <td className="px-4 py-3 text-muted">
                      {dateStr}
                      {isLatest && (
                        <span className="ml-2 text-2xs font-bold text-accent uppercase tracking-wide">Latest</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {rm.rating && (
                        <span className={`text-xs font-black px-2 py-0.5 rounded-full ${RATING_STYLES[rm.rating] || 'bg-line text-ink'}`}>
                          {rm.rating}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink">{rm.weighted_avg_tp || rm.tp_range || '—'}</td>
                    <td className="px-4 py-3 text-muted">{rm.cmp ? `₹${rm.cmp}` : '—'}</td>
                    <td className={`px-4 py-3 font-semibold ${String(rm.implied_upside).startsWith('+') ? 'text-positive' : 'text-negative'}`}>
                      {rm.implied_upside || '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/research/${report.id}`}
                        className="text-accent text-xs font-bold hover:underline"
                      >
                        Read →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* All reports */}
      <section>
        <h2 className="text-base font-bold text-ink mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-accent" />
          All Reports
        </h2>
        <div className="space-y-4">
          {reports.map((report, i) => {
            const rm = report.report_meta || {}
            return (
              <Link
                key={report.id}
                href={`/research/${report.id}`}
                className="block bg-panel border border-line rounded-xl p-5 hover:border-accent/40 transition-colors group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      {rm.rating && (
                        <span className={`text-2xs font-black px-2 py-0.5 rounded-full ${RATING_STYLES[rm.rating] || 'bg-line text-ink'}`}>
                          {rm.rating}
                        </span>
                      )}
                      {i === 0 && (
                        <span className="text-2xs font-bold text-accent uppercase tracking-wide">Latest</span>
                      )}
                    </div>
                    <h3 className="font-bold text-ink group-hover:text-accent transition-colors mb-1 leading-snug">
                      {report.title}
                    </h3>
                    <p className="text-sm text-muted line-clamp-2">
                      {rm.tagline || report.excerpt}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    {rm.weighted_avg_tp && (
                      <p className="text-xs font-semibold text-ink mb-1">TP {rm.weighted_avg_tp}</p>
                    )}
                    <span className="text-xs text-muted flex items-center gap-1 justify-end">
                      <Calendar className="w-3 h-3" />
                      {new Date(report.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

    </div>
  )
}
