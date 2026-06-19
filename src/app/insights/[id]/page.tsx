import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Calendar, ArrowLeft } from 'lucide-react'

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: insight } = await supabase
    .from('insights')
    .select('title, body, tags')
    .eq('id', id)
    .single()

  if (!insight) return { title: 'Insight Not Found' }

  const plainText = insight.body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const description = plainText.length > 160
    ? plainText.slice(0, 157).trimEnd() + '…'
    : plainText

  return {
    title: insight.title,
    description,
    openGraph: {
      title: insight.title,
      description,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: insight.title,
      description,
    },
  }
}

export default async function InsightPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: insight } = await supabase
    .from('insights')
    .select('*')
    .eq('id', id)
    .single()

  if (!insight) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.role === 'admin'
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-[54px] pb-[86px]">

      <Link
        href="/insights"
        className="inline-flex items-center gap-2 text-muted text-sm hover:text-ink transition-colors mb-10"
      >
        <ArrowLeft className="w-4 h-4" />
        All Insights
      </Link>

      <article className="max-w-[720px]">

        {/* Tags */}
        {insight.tags?.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-5">
            {insight.tags.map((tag: string) => (
              <Link
                key={tag}
                href={`/insights?tag=${encodeURIComponent(tag)}`}
                className="text-xs font-bold uppercase tracking-[0.06em] text-accent bg-accent/8 px-2 py-0.5 rounded hover:bg-accent hover:text-paper transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-h1 font-bold text-ink leading-[1.15] tracking-tight mb-4">
          {insight.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-muted mb-8 pb-8 border-b border-line">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {new Date(insight.created_at).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          {isAdmin && (
            <Link
              href={`/admin/insights/edit/${insight.id}`}
              className="ml-auto text-accent font-semibold hover:underline text-sm"
            >
              Edit
            </Link>
          )}
        </div>

        {/* Body */}
        <div
          className="rich-editor leading-[1.85] text-lg"
          dangerouslySetInnerHTML={{ __html: insight.body }}
        />

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-line">
          <p className="text-xs text-muted uppercase tracking-[0.08em] font-bold mb-1">
            Aadith Santosh
          </p>
          <p className="text-xs text-muted">
            Independent equity research. Views are personal and not investment advice.
          </p>
        </div>

      </article>

      {/* CTA */}
      <div className="mt-14 p-6 rounded-xl border border-line bg-panel max-w-[720px]">
        <p className="text-sm font-bold text-ink mb-1">Looking for in-depth analysis?</p>
        <p className="text-sm text-muted mb-4">Full research reports with valuation models and sector deep-dives.</p>
        <Link
          href="/research"
          className="inline-flex items-center justify-center min-h-[40px] px-5 bg-ink text-paper rounded-lg font-bold text-sm hover:-translate-y-0.5 transition-all"
        >
          View Research Reports
        </Link>
      </div>

    </div>
  )
}
