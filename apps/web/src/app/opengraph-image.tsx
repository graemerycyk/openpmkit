import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'pmkit - Your daily PM toolkit';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              background: '#3b82f6',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '24px',
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <line x1="10" y1="9" x2="8" y2="9" />
            </svg>
          </div>
          <span
            style={{
              fontSize: '72px',
              fontWeight: 700,
              color: 'white',
              fontFamily: 'system-ui',
            }}
          >
            pmkit
          </span>
        </div>

        {/* Tagline */}
        <p
          style={{
            fontSize: '36px',
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: 1.4,
          }}
        >
          Your daily PM toolkit - briefs, meetings, and PRDs made simple.
        </p>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: '40px',
            marginTop: '60px',
          }}
        >
          {['Daily Briefs', 'VoC Themes', 'PRD Drafts'].map((feature) => (
            <div
              key={feature}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#e2e8f0',
                fontSize: '24px',
              }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  background: '#3b82f6',
                  borderRadius: '50%',
                }}
              />
              {feature}
            </div>
          ))}
        </div>

        {/* URL */}
        <p
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: '20px',
            color: '#64748b',
          }}
        >
          getpmkit.com
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
}

