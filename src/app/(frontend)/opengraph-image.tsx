import { ImageResponse } from 'next/og'

export const alt = 'GDG Nairobi — a developer community for Nairobi'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        padding: '62px 68px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: '#202124',
        backgroundColor: '#f8f9fa',
        backgroundImage:
          'radial-gradient(circle at 89% 14%, rgba(251,188,4,.26), transparent 25%), linear-gradient(rgba(32,33,36,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(32,33,36,.06) 1px, transparent 1px)',
        backgroundSize: 'auto, 54px 54px, 54px 54px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <svg fill="none" height="42" viewBox="0 0 32 17" width="79" xmlns="http://www.w3.org/2000/svg">
          <path d="M1.331 5.945 8.841.595c1.433-1.02 3.43-.696 4.458.723l.005.006c1.028 1.42.701 3.398-.732 4.419l-7.51 5.35c-1.433 1.02-3.43.695-4.458-.723L.6 10.363C-.429 8.943-.102 6.965 1.33 5.945Z" fill="#EA4335" />
          <path d="m.602 6.636.004-.006c1.029-1.42 3.025-1.743 4.458-.723l7.51 5.35c1.434 1.02 1.76 2.998.732 4.419l-.005.006c-1.028 1.42-3.025 1.743-4.458.722l-7.512-5.351C-.102 10.032-.429 8.054.6 6.634l.002.002Z" fill="#4285F4" />
          <path d="m19.427 11.251 7.511-5.35c1.433-1.02 3.427-.695 4.458.723l.004.006c1.029 1.42.702 3.398-.731 4.419l-7.51 5.349c-1.433 1.021-3.43.696-4.458-.722l-.005-.006c-1.028-1.421-.701-3.399.731-4.419Z" fill="#F9AB00" />
          <path d="m18.696 1.327.005-.006c1.028-1.421 3.025-1.743 4.458-.723l7.51 5.35c1.433 1.02 1.76 2.998.731 4.418l-.004.007c-1.029 1.42-3.025 1.743-4.458.722l-7.51-5.349c-1.434-1.02-1.76-2.999-.732-4.419Z" fill="#34A853" />
        </svg>
        <span style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-1.5px' }}>GDG Nairobi</span>
      </div>
      <div style={{ maxWidth: 860, display: 'flex', flexDirection: 'column' }}>
        <span style={{ marginBottom: 20, fontSize: 19, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase' }}>Volunteer-led · Nairobi, Kenya</span>
        <span style={{ fontSize: 93, fontWeight: 700, lineHeight: .9, letterSpacing: '-6px' }}>A developer community</span>
        <span style={{ fontSize: 93, fontWeight: 700, lineHeight: .9, letterSpacing: '-6px', color: '#174ea6' }}>for Nairobi.</span>
      </div>
      <div style={{ width: 560, height: 11, display: 'flex', borderRadius: 999, overflow: 'hidden' }}>
        <span style={{ flex: 1, background: '#4285f4' }} />
        <span style={{ flex: 1, background: '#ea4335' }} />
        <span style={{ flex: 1, background: '#fbbc04' }} />
        <span style={{ flex: 1, background: '#34a853' }} />
      </div>
    </div>,
    size,
  )
}
