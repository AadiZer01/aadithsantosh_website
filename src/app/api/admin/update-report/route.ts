import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Verify admin auth
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { id, title, content, excerpt, pdf_url, report_meta } = body

    if (!id || !title || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Perform update — on the server side, the session cookies are forwarded
    const { data, error: updateError } = await supabase
      .from('research_posts')
      .update({
        title,
        content,
        excerpt: excerpt || '',
        pdf_url: pdf_url || null,
        report_meta: report_meta || null,
      })
      .eq('id', id)
      .select('id, title')

    if (updateError) {
      console.error('API update error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'No rows updated — post may not exist' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error('API error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
