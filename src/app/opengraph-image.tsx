import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 35%, #041b3d 0%, #00030a 70%)',
        color: '#ffffff',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: '50%',
          border: '4px solid #00d9ff',
          boxShadow: '0 0 60px rgba(0, 217, 255, 0.7)',
          marginBottom: 32,
        }}
      />
      <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: -1 }}>Caro Zamani</div>
      <div style={{ fontSize: 30, color: 'rgba(255,255,255,0.72)', marginTop: 16 }}>
        UX &amp; Product Designer
      </div>
    </div>,
    { ...size },
  );
}
