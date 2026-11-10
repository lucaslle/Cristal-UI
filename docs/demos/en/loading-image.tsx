'use client';

import { useState } from 'react';
import { CrBox, CrButton, CrImage } from '@cristal/react';

const landscape = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180"><defs><linearGradient id="sky" x2="0" y2="1"><stop offset="0" stop-color="#4c1d95"/><stop offset="1" stop-color="#db2777"/></linearGradient></defs><rect width="320" height="180" fill="url(#sky)"/><circle cx="200" cy="118" r="28" fill="#fcd34d"/><path d="M0 180 70 100l50 40 60-60 70 70 70-40v70z" fill="#6d28d9"/><path d="M0 180 50 140l60 20 60-40 70 50 80-30v40z" fill="#3b0764"/></svg>',
)}`;

export default function LoadingImage() {
  const [key, setKey] = useState(0);

  return (
    <CrBox display="flex" direction="column" gap="lg" align="start" style={{ width: '100%', maxWidth: 360 }}>
      <CrImage key={key} src={landscape} alt="Purple mountains at sunset" style={{ width: '100%', aspectRatio: '16 / 9', borderRadius: 12 }} />
      <CrButton size="s" variant="secondary" onClick={() => setKey(key + 1)}>
        Reload the image
      </CrButton>
    </CrBox>
  );
}
