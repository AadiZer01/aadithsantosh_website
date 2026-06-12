import { createClient } from '@/lib/supabase/server'
import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aadithsantosh.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from('research_posts')
    .select('id, updated_at')
    .eq('published', true)

  const { data: insights } = await supabase
    .from('insights')
    .select('id, created_at')

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/research`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/insights`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ]

  const postRoutes: MetadataRoute.Sitemap = (posts || []).map((post) => ({
    url: `${SITE_URL}/research/${post.id}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: 'monthly',
    priority: 0.9,
  }))

  const insightRoutes: MetadataRoute.Sitemap = (insights || []).map((insight) => ({
    url: `${SITE_URL}/insights/${insight.id}`,
    lastModified: new Date(insight.created_at),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...postRoutes, ...insightRoutes]
}
