import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

export const alt = 'Honeybee Referral Club — grow your business through trusted referrals';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const NAVY = '#1B2745';
const GOLD = '#D9A21A';

export default function OpengraphImage() {
  // Inlined as a data URI: ImageResponse renders at build time, so there is no
  // server to fetch /icon.svg from.
  const mark = readFileSync(join(process.cwd(), 'src/app/icon.svg'), 'utf8');
  const markSrc = `data:image/svg+xml;base64,${Buffer.from(mark).toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          backgroundColor: NAVY,
          backgroundImage: `radial-gradient(circle at 78% 22%, rgba(217,162,26,0.28) 0%, rgba(27,39,69,0) 55%)`,
        }}
      >
        {/* next/image is unavailable inside ImageResponse — Satori renders raw <img>. */}
        <img src={markSrc} width={132} height={132} alt="" />

        <div
          style={{
            display: 'flex',
            marginTop: 40,
            fontSize: 68,
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
          }}
        >
          Honeybee Referral Club
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 22,
            fontSize: 32,
            color: 'rgba(255,255,255,0.72)',
            lineHeight: 1.35,
          }}
        >
          Grow your business through trusted referrals.
        </div>

        <div style={{ display: 'flex', marginTop: 48, height: 8, width: 180, backgroundColor: GOLD, borderRadius: 4 }} />
      </div>
    ),
    size
  );
}
