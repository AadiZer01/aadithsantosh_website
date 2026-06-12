import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

export async function generateMetadata(
  { params }: { params: Promise<{ ticker: string }> }
): Promise<Metadata> {
  const { ticker } = await params
  const upper = ticker.toUpperCase()
  const supabase = await createClient()

  const { data } = await supabase
    .from('research_posts')
    .select('report_meta')
    .filter('report_meta->>ticker', 'eq', upper)
    .order('created_at', { ascending: false })
    .limit(1)

  const m = data?.[0]?.report_meta || {}

  return {
    title: `${upper} — Equity Research`,
    description:
      m.tagline ||
      `Independent equity research on ${upper}. Valuation analysis and investment recommendations by Aadith Santosh.`,
  }
}

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
