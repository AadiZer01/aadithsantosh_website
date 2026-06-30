import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aadithsantosh.com'

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  // Try slug first, then fall back to UUID
  let { data: postRows } = await supabase
    .from('research_posts')
    .select('title, excerpt, report_meta, seo_meta')
    .eq('slug', id)
    .limit(1)

  if (!postRows?.length) {
    const { data: byId } = await supabase
      .from('research_posts')
      .select('title, excerpt, report_meta, seo_meta')
      .eq('id', id)
      .limit(1)
    postRows = byId
  }

  const post = postRows?.[0] ?? null

  if (!post) return { title: 'Report Not Found' }

  const m = post.report_meta || {}
  const s = post.seo_meta || {}
  const canonicalSlug = post.slug || id

  // Auto-generated fallbacks
  const autoTitle = m.ticker ? `${m.ticker} — ${post.title}` : post.title
  const autoDescription = m.tagline || post.excerpt || `Equity research report on ${post.title}. Independent valuation analysis by Aadith Santosh.`
  const ratingLabel = m.rating ? ` · ${m.rating}` : ''
  const sectorLabel = m.sector ? ` · ${m.sector}` : ''

  // Manual overrides take precedence
  const title = s.seo_title || autoTitle
  const description = s.seo_description || autoDescription
  const ogTitle = s.og_title || `${autoTitle}${ratingLabel}${sectorLabel}`
  const ogDescription = s.og_description || autoDescription

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/research/${canonicalSlug}`,
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: s.og_title || `${autoTitle}${ratingLabel}`,
      description: ogDescription,
    },
  }
}

export default function ResearchReportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
