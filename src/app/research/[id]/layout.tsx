import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: post } = await supabase
    .from('research_posts')
    .select('title, excerpt, report_meta')
    .eq('id', id)
    .single()

  if (!post) return { title: 'Report Not Found' }

  const m = post.report_meta || {}
  const title = m.ticker ? `${m.ticker} — ${post.title}` : post.title
  const description = m.tagline || post.excerpt || `Equity research report on ${post.title}. Independent valuation analysis by Aadith Santosh.`
  const ratingLabel = m.rating ? ` · ${m.rating}` : ''
  const sectorLabel = m.sector ? ` · ${m.sector}` : ''

  return {
    title,
    description,
    openGraph: {
      title: `${title}${ratingLabel}${sectorLabel}`,
      description,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title}${ratingLabel}`,
      description,
    },
  }
}

export default function ResearchReportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
