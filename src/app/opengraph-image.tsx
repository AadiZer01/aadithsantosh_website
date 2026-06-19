import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#021A3E',
          padding: '80px',
          position: 'relative',
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: '#8A4B2A',
          }}
        />

        {/* Monogram */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 72,
            height: 72,
            borderRadius: '50%',
            border: '2px solid #FFF7F3',
            marginBottom: 56,
          }}
        >
          <span
            style={{
              color: '#FFF7F3',
              fontSize: 26,
              fontWeight: 800,
              fontFamily: 'sans-serif',
              letterSpacing: '-0.5px',
            }}
          >
            AS
          </span>
        </div>

        {/* Eyebrow */}
        <div
          style={{
            color: '#8A4B2A',
            fontSize: 15,
            fontWeight: 700,
            fontFamily: 'sans-serif',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: 24,
          }}
        >
          INDEPENDENT EQUITY RESEARCH
        </div>

        {/* Main title */}
        <div
          style={{
            color: '#FFF7F3',
            fontSize: 72,
            fontWeight: 700,
            fontFamily: 'serif',
            lineHeight: 1.1,
            marginBottom: 32,
            maxWidth: 900,
          }}
        >
          Aadith Santosh
        </div>

        {/* Description */}
        <div
          style={{
            color: '#8E9CB0',
            fontSize: 24,
            fontFamily: 'sans-serif',
            lineHeight: 1.5,
            maxWidth: 700,
          }}
        >
          Fundamentals-driven analysis of Indian public equities — business quality, valuation, and return potential.
        </div>

        {/* Bottom rule */}
        <div
          style={{
            position: 'absolute',
            bottom: 72,
            left: 80,
            right: 80,
            height: 1,
            background: '#1E3460',
          }}
        />

        {/* Domain */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            left: 80,
            color: '#5E6A7D',
            fontSize: 16,
            fontFamily: 'sans-serif',
            letterSpacing: '0.04em',
          }}
        >
          aadithsantosh.com
        </div>
      </div>
    ),
    size,
  )
}
