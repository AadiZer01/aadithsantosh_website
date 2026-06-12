import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, FileText, MessageSquare, ThumbsUp, Eye, Plus, Pencil, Lightbulb } from 'lucide-react'

async function getStats(supabase: any) {

  const { count: users } = await supabase

    .from('profiles')

    .select('*', { count: 'exact', head: true })



  const { count: posts } = await supabase

    .from('research_posts')

    .select('*', { count: 'exact', head: true })



  const { count: comments } = await supabase

    .from('comments')

    .select('*', { count: 'exact', head: true })



  const { count: reactions } = await supabase

    .from('reactions')

    .select('*', { count: 'exact', head: true })



  const { data: recentPosts } = await supabase

    .from('research_posts')

    .select('*')

    .order('created_at', { ascending: false })

    .limit(5)



  const { data: topPosts } = await supabase

    .from('research_posts')

    .select('*')

    .order('views', { ascending: false })

    .limit(5)

  const { count: insights } = await supabase
    .from('insights')
    .select('*', { count: 'exact', head: true })

  const { data: recentInsights } = await supabase
    .from('insights')
    .select('id, title, tags, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  return { users, posts, comments, reactions, recentPosts, topPosts, insights, recentInsights }

}



export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    console.error('Auth error:', userError)
    redirect('/login')
  }
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profileError) {
    console.error('Profile error:', profileError)
  }
  
  if (!profile || profile.role !== 'admin') {
    console.log('Not admin. Profile:', profile)
    redirect('/')
  }

  const stats = await getStats(supabase)



  const cards = [
    { title: 'Total Users', value: stats.users || 0, icon: Users, color: 'bg-paper text-accent' },
    { title: 'Research Posts', value: stats.posts || 0, icon: FileText, color: 'bg-positive/10 text-positive' },
    { title: 'Insights', value: stats.insights || 0, icon: Lightbulb, color: 'bg-caution/10 text-caution' },
    { title: 'Comments', value: stats.comments || 0, icon: MessageSquare, color: 'bg-paper text-accent' },
    { title: 'Reactions', value: stats.reactions || 0, icon: ThumbsUp, color: 'bg-paper text-accent' },
  ]



  return (

    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">

      <div className="flex items-center justify-between mb-8">

        <div>

          <h1 className="text-3xl font-bold text-ink">Admin Dashboard</h1>

          <p className="text-muted mt-1">Overview of your research platform</p>

        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/insights/publish"
            className="inline-flex items-center gap-2 px-4 py-2 border border-accent text-accent rounded-lg font-medium hover:bg-accent/5 transition-all text-sm"
          >
            <Pencil className="w-4 h-4" />
            New Insight
          </Link>
          <Link
            href="/admin/publish"
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            New Report
          </Link>
        </div>

      </div>



      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">

        {cards.map((card) => (

          <div key={card.title} className="bg-panel rounded-xl border border-line p-6">

            <div className={'inline-flex items-center justify-center w-10 h-10 rounded-lg ' + card.color + ' mb-4'}>

              <card.icon className="w-5 h-5" />

            </div>

            <p className="text-2xl font-bold text-ink">{card.value}</p>

            <p className="text-sm text-muted mt-1">{card.title}</p>

          </div>

        ))}

      </div>



      <div className="grid lg:grid-cols-3 gap-8">

        <div className="bg-panel rounded-xl border border-line p-6">

          <h2 className="text-lg font-semibold text-ink mb-4">Recent Posts</h2>

          {stats.recentPosts && stats.recentPosts.length > 0 ? (

            <div className="space-y-3">

              {stats.recentPosts.map((post: any) => (

                                <div key={post.id} className="flex items-center justify-between py-2 border-b border-line last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{post.title}</p>
                    <p className="text-xs text-muted">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted ml-4">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {post.views || 0}
                    </span>
                    <Link href={`/admin/edit/${post.id}`} className="text-accent hover:text-accent/80 transition-colors" title="Edit report">
                      <Pencil className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

              ))}

            </div>

          ) : (

            <p className="text-sm text-muted text-center py-8">No posts yet</p>

          )}

        </div>



        <div className="bg-panel rounded-xl border border-line p-6">

          <h2 className="text-lg font-semibold text-ink mb-4">Most Viewed</h2>

          {stats.topPosts && stats.topPosts.length > 0 ? (

            <div className="space-y-3">

              {stats.topPosts.map((post: any, i: number) => (

                <div key={post.id} className="flex items-center gap-3 py-2 border-b border-line last:border-0">

                  <span className="text-sm font-bold text-muted w-6">#{i + 1}</span>

                  <div className="flex-1 min-w-0">

                    <p className="text-sm font-medium text-ink truncate">{post.title}</p>

                    <p className="text-xs text-muted">{post.views || 0} views</p>

                  </div>

                </div>

              ))}

            </div>

          ) : (

            <p className="text-sm text-muted text-center py-8">No data yet</p>

          )}

        </div>

        {/* Recent Insights */}
        <div className="bg-panel rounded-xl border border-line p-6">
          <h2 className="text-lg font-semibold text-ink mb-4">Recent Insights</h2>
          {stats.recentInsights && stats.recentInsights.length > 0 ? (
            <div className="space-y-3">
              {stats.recentInsights.map((insight: any) => (
                <div key={insight.id} className="flex items-center justify-between py-2 border-b border-line last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{insight.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {insight.tags?.slice(0, 2).map((tag: string) => (
                        <span key={tag} className="text-[0.65rem] font-bold text-accent/70">{tag}</span>
                      ))}
                      <span className="text-xs text-muted">
                        {insight.tags?.length > 2 && '· '}
                        {new Date(insight.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Link href={`/admin/insights/edit/${insight.id}`} className="text-accent hover:text-accent/80 transition-colors ml-4" title="Edit insight">
                    <Pencil className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted text-center py-8">No insights yet</p>
          )}
        </div>

      </div>

    </div>

  )

}








