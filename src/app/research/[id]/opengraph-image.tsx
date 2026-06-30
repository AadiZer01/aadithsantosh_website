import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const alt = 'Equity Research Report'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const RATING_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  BUY:            { bg: '#1F7A4D', text: '#ffffff', border: '#2a9e63' },
  ACCUMULATE:     { bg: '#1F7A4D', text: '#ffffff', border: '#2a9e63' },
  HOLD:           { bg: '#B7791F', text: '#ffffff', border: '#d18d24' },
  SELL:           { bg: '#B42318', text: '#ffffff', border: '#d4291d' },
  'UNDER REVIEW': { bg: '#4b5568', text: '#ffffff', border: '#6b7280' },
}

export default async function Image({ params }: { params: { id: string } }) {
  const { id } = await params

  // Use a plain supabase client (no cookies needed — public read)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Two-step lookup: slug first, then UUID
  let { data: postRows } = await supabase
    .from('research_posts')
    .select('title, report_meta')
    .eq('slug', id)
    .limit(1)

  if (!postRows?.length) {
    const { data: byId } = await supabase
      .from('research_posts')
      .select('title, report_meta')
      .eq('id', id)
      .limit(1)
    postRows = byId
  }

  const post = postRows?.[0] ?? null
  const m = post?.report_meta || {}

  const ticker: string = m.ticker || ''
  const title: string = post?.title || 'Research Report'
  const rating: string = m.rating || ''
  const sector: string = m.sector || ''
  const ratingStyle = RATING_COLORS[rating]

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#021A3E',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 72px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle warm gradient overlay — matches the accent rust */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '480px',
            height: '480px',
            background: 'radial-gradient(circle at top right, rgba(138,75,42,0.18) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Top row: brand + sector */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Brand mark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                background: '#8A4B2A',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: '900',
                color: '#FFF7F3',
                letterSpacing: '-0.5px',
              }}
            >
              AS
            </div>
            <span
              style={{
                color: '#8fa8c0',
                fontSize: '15px',
                fontWeight: '600',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Aadith Santosh — Equity Research
            </span>
          </div>

          {/* Sector tag */}
          {sector && (
            <span
              style={{
                color: '#5d7a96',
                fontSize: '14px',
                fontWeight: '700',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              {sector}
            </span>
          )}
        </div>

        {/* Centre: ticker + title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '22px',
          }}
        >
          {ticker && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(138,75,42,0.14)',
                border: '1.5px solid rgba(138,75,42,0.35)',
                borderRadius: '8px',
                padding: '8px 18px',
                width: 'fit-content',
              }}
            >
              <span
                style={{
                  color: '#c47a50',
                  fontSize: '20px',
                  fontWeight: '900',
                  letterSpacing: '0.12em',
                }}
              >
                {ticker}
              </span>
            </div>
          )}

          <div
            style={{
              color: '#EEF2F7',
              fontSize: title.length > 65 ? '36px' : title.length > 45 ? '42px' : '50px',
              fontWeight: '700',
              lineHeight: '1.2',
              maxWidth: '980px',
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </div>
        </div>

        {/* Bottom row: rating + domain */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          {ratingStyle ? (
            <div
              style={{
                background: ratingStyle.bg,
                color: ratingStyle.text,
                fontSize: '14px',
                fontWeight: '900',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '10px 24px',
                borderRadius: '999px',
                border: `1px solid ${ratingStyle.border}`,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {rating}
            </div>
          ) : (
            <div />
          )}

          <span
            style={{
              color: '#3d566d',
              fontSize: '14px',
              fontWeight: '500',
              letterSpacing: '0.02em',
            }}
          >
            aadithsantosh.com
          </span>
        </div>
      </div>
    ),
    { ...size }
  )
}
