import { ImageResponse } from 'next/og';

/**
 * Tarjeta que se ve al pegar el enlace en WhatsApp, Instagram o Facebook.
 * Es lo primero que ve la mayoría de la gente: sin ella el enlace sale como
 * una línea de texto y casi nadie lo abre.
 */
export const alt =
  'CaliSolidario — conecta a quien necesita ayuda en Cali con quien puede darla';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: '#0f6f5c',
          color: '#ffffff',
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 92, fontWeight: 800, letterSpacing: -2 }}>
          CaliSolidario
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 24,
            fontSize: 44,
            lineHeight: 1.25,
            opacity: 0.95,
          }}
        >
          Quien necesita ayuda y quien puede darla, en el mismo lugar.
        </div>

        <div style={{ display: 'flex', marginTop: 48, gap: 20 }}>
          <div
            style={{
              display: 'flex',
              background: '#ffffff',
              color: '#0f6f5c',
              borderRadius: 999,
              padding: '14px 32px',
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            🙋 Necesito ayuda
          </div>
          <div
            style={{
              display: 'flex',
              background: 'rgba(255,255,255,0.18)',
              borderRadius: 999,
              padding: '14px 32px',
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            🤝 Quiero ayudar
          </div>
        </div>

        <div style={{ display: 'flex', marginTop: 'auto', fontSize: 30, opacity: 0.85 }}>
          calisolidario.triadaaliados.com
        </div>
      </div>
    ),
    size,
  );
}
