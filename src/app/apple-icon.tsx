import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  const mark = readFileSync(join(process.cwd(), 'src/app/icon.svg'), 'utf8');
  const markSrc = `data:image/svg+xml;base64,${Buffer.from(mark).toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFFFFF',
        }}
      >
        {/* next/image is unavailable inside ImageResponse — Satori renders raw <img>. */}
        <img src={markSrc} width={168} height={168} alt="" />
      </div>
    ),
    size
  );
}
