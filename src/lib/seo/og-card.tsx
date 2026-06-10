/**
 * og-card.tsx - Layout OG card dùng chung cho 3 route opengraph-image (DRY).
 * Inline style (Satori-compatible): nền gradient Aurora, eyebrow + title + brand.
 */

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = 'image/png';

/** Cắt title quá dài để không tràn card. */
function clampTitle(title: string, max = 92): string {
  return title.length > max ? `${title.slice(0, max - 1).trimEnd()}…` : title;
}

export function OgCard({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '76px',
        background: 'linear-gradient(135deg, #4f46e5 0%, #a855f7 52%, #ec4899 100%)',
        fontFamily: 'Be Vietnam Pro',
      }}
    >
      <div
        style={{
          display: 'flex',
          fontSize: 28,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.85)',
        }}
      >
        {eyebrow}
      </div>
      <div
        style={{
          display: 'flex',
          fontSize: 66,
          fontWeight: 600,
          lineHeight: 1.12,
          color: '#ffffff',
          maxWidth: '90%',
        }}
      >
        {clampTitle(title)}
      </div>
      <div
        style={{
          display: 'flex',
          fontSize: 30,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.92)',
        }}
      >
        nguyenvantai.com · Tài AI Automation
      </div>
    </div>
  );
}
