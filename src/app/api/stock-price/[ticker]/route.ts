import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params
  // Append .NS for NSE if no exchange suffix provided
  const symbol = ticker.includes('.') ? ticker : `${ticker}.NS`

  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        next: { revalidate: 300 }, // cache 5 minutes
      }
    )

    if (!res.ok) return NextResponse.json({ error: 'Upstream error' }, { status: 502 })

    const data = await res.json()
    const meta = data?.chart?.result?.[0]?.meta

    if (!meta?.regularMarketPrice) {
      return NextResponse.json({ error: 'Price not found' }, { status: 404 })
    }

    return NextResponse.json({
      price: meta.regularMarketPrice,
      currency: meta.currency ?? 'INR',
      marketState: meta.marketState ?? 'CLOSED', // REGULAR | PRE | POST | CLOSED
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch price' }, { status: 500 })
  }
}
