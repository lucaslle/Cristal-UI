'use client';

import { useState } from 'react';
import { CrIconButton } from '@cristal/react';
import { Bold, Heart, Italic, Underline } from 'lucide-react';

export default function IconButtonToggle() {
  const [liked, setLiked] = useState(false);
  return (
    <>
      <div role="toolbar" aria-label="Formatting" style={{ display: 'flex', gap: 4 }}>
        <CrIconButton label="Bold" size="s" toggle>
          <Bold aria-hidden="true" />
        </CrIconButton>
        <CrIconButton label="Italic" size="s" toggle>
          <Italic aria-hidden="true" />
        </CrIconButton>
        <CrIconButton label="Underline" size="s" toggle>
          <Underline aria-hidden="true" />
        </CrIconButton>
      </div>
      <CrIconButton label="Add to favorites" variant="outline" shape="round" toggle pressed={liked} onCrToggle={(event) => setLiked(event.detail)}>
        <Heart aria-hidden="true" fill={liked ? 'currentColor' : 'none'} />
      </CrIconButton>
    </>
  );
}
