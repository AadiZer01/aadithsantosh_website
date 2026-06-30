import Link from "next/link";
import { TrendingUp, BarChart3, Shield, Search, Mail, ArrowRight } from "lucide-react";
import { createClient } from '@/lib/supabase/server'

const RATING_STYLES: Record<string, string> = {
  BUY:            'bg-positive/15 text-positive',
  ACCUMULATE:     'bg-positive/15 text-positive',
  HOLD:           'bg-caution/15 text-caution',
  SELL:           'bg-negative/15 text-negative',
  'UNDER REVIEW': 'bg-muted/15 text-muted',
}

const PHILOSOPHY = [
  { icon: Search,    title: 'Business Quality',     body: 'Competitive moat, management track record, and the durability of earnings before anything else.' },
  { icon: BarChart3, title: 'Industry Structure',   body: 'Sector dynamics, pricing power, and where a company sits in its industry cycle.' },
  { icon: Shield,    title: 'Financial Durability',  body: 'Cash conversion, balance sheet strength, and the ability to withstand a bad year.' },
  { icon: TrendingUp,title: 'Valuation Discipline', body: 'Blended intrinsic and market-based valuation with conservative assumptions and scenario testing.' },
]

export default async function Home() {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('research_posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <div className="flex flex-col">

      {/* ── Hero ── */}
      <section className="w-full bg-paper relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #021A3E 1px, transparent 0)', backgroundSize: '40px 40px' }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 max-md:py-16">
          <div className="max-w-3xl">
            <p className="text-accent font-extrabold text-xs tracking-[0.08em] uppercase mb-4">
              Aadith Santosh · Equity Research
            </p>
            <div className="w-10 h-[3px] bg-accent rounded-full mb-6" />
            <h1 className="text-display font-bold text-ink leading-[1.08] tracking-tight mb-5">
              Independent Equity Research &amp; Valuation Insights
            </h1>
            <p className="text-lg text-muted max-w-[580px] leading-relaxed mb-9">
              Disciplined valuation reports on Indian listed companies — combining structured financial analysis with real-world business judgement.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/research"
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 bg-ink text-paper rounded-lg font-bold text-ui hover:-translate-y-0.5 transition-all"
              >
                View Research Reports
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center min-h-[48px] px-6 border border-ink text-ink rounded-lg font-bold text-ui hover:-translate-y-0.5 transition-all"
              >
                About Aadith
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Research ── */}
      <section className="w-full bg-paper border-t border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-accent font-extrabold text-xs tracking-[0.08em] uppercase mb-2">
                Latest
              </p>
              <h2 className="text-2xl font-bold text-ink tracking-tight">Featured Research</h2>
            </div>
            <Link
              href="/research"
              className="inline-flex items-center gap-1 text-sm text-muted font-semibold hover:text-ink transition-colors border-b border-transparent hover:border-ink pb-0.5"
            >
              All reports <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {posts && posts.length > 0 ? posts.map((post: any) => {
              const m = post.report_meta || {}
              const ratingStyle = RATING_STYLES[m.rating] ?? 'bg-muted/15 text-muted'
              return (
                <Link
                  key={post.id}
                  href={`/research/${post.slug || post.id}`}
                  className="bg-panel border border-line rounded-xl p-6 flex flex-col hover:border-accent/40 transition-colors group"
                >
                  {/* Ticker + rating */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {m.ticker && (
                        <span className="text-xs font-extrabold tracking-[0.06em] text-ink bg-line/40 px-2 py-0.5 rounded">
                          {m.ticker}
                        </span>
                      )}
                      {m.sector && (
                        <span className="text-xs text-muted font-semibold">{m.sector}</span>
                      )}
                    </div>
                    {m.rating && (
                      <span className={`text-xs font-black uppercase tracking-[0.06em] px-2.5 py-0.5 rounded-full ${ratingStyle}`}>
                        {m.rating}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-ink mb-2 leading-snug group-hover:text-accent transition-colors flex-1">
                    {post.title}
                  </h3>

                  {/* Tagline */}
                  <p className="text-sm text-muted leading-relaxed line-clamp-2 mb-4">
                    {m.tagline || post.excerpt || 'Click to read the full report.'}
                  </p>

                  {/* Footer */}
                  <div className="pt-4 border-t border-line flex items-center justify-between">
                    <span className="text-xs text-muted">
                      {m.tp_range ? `TP: ${m.tp_range}` : new Date(post.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-xs text-accent font-bold inline-flex items-center gap-1">
                      Read <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              )
            }) : (
              <div className="col-span-3 text-center py-16 border border-line rounded-xl bg-panel">
                <p className="text-sm text-muted">Research reports coming soon.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Valuation Philosophy ── */}
      <section className="w-full bg-paper border-t border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 max-md:py-14">
          <div className="max-w-[520px] mb-12">
            <p className="text-accent font-extrabold text-xs tracking-[0.08em] uppercase mb-3">
              Approach
            </p>
            <h2 className="text-2xl font-bold text-ink tracking-tight mb-3">Valuation Philosophy</h2>
            <p className="text-muted leading-relaxed">
              A structured framework combining fundamentals, market context, and professional judgement built from real-world business exposure.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PHILOSOPHY.map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-panel border border-line rounded-xl p-6 hover:border-accent/30 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-ui font-bold text-ink mb-2">{title}</h3>
                <p className="text-sm text-muted leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section className="w-full bg-paper border-t border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 max-md:py-14">
          <div className="max-w-[480px]">
            <p className="text-accent font-extrabold text-xs tracking-[0.08em] uppercase mb-3">
              Contact
            </p>
            <h2 className="text-2xl font-bold text-ink tracking-tight mb-3">Get in Touch</h2>
            <p className="text-muted leading-relaxed mb-8">
              Have questions about a report or want to discuss a company? I&apos;d be glad to hear from you.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="mailto:aadithsantosh@outlook.com"
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 bg-ink text-paper rounded-lg font-bold text-ui hover:-translate-y-0.5 transition-all"
              >
                <Mail className="w-4 h-4" />
                Email Aadith
              </a>
              <a
                href="https://www.linkedin.com/in/aadith-santosh-8b3b07204"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 border border-ink text-ink rounded-lg font-bold text-ui hover:-translate-y-0.5 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/>
                </svg>
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
