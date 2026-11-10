'use client';

import { useState } from 'react';
import { CrIconButton } from '@cristal/react';

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const heart = 'M19 14c1.5-1.5 3-3.3 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z';
const bell = 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0';
const bold = 'M6 12h9a4 4 0 0 1 0 8H6V4h8a4 4 0 0 1 0 8';
const italic = 'M19 4h-9M14 20H5M15 4 9 20';
const pencil = 'M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z';
const trash = 'M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2';

const row = { display: 'flex', gap: 'var(--cr-spacing-sm)', alignItems: 'center', marginBottom: 'var(--cr-spacing-lg)' };

export function IconButtonDemo() {
  const [liked, setLiked] = useState(false);
  const [unread, setUnread] = useState(3);
  return (
    <>
      <div role="toolbar" aria-label="Mise en forme" style={row}>
        <CrIconButton label="Gras" toggle>
          <Icon d={bold} />
        </CrIconButton>
        <CrIconButton label="Italique" toggle>
          <Icon d={italic} />
        </CrIconButton>
        <CrIconButton label="Ajouter aux favoris" variant="outline" shape="round" toggle pressed={liked} onCrToggle={(e) => setLiked(e.detail)}>
          <Icon d={heart} />
        </CrIconButton>
        <span data-testid="liked">{liked ? 'Favori' : 'Pas favori'}</span>
      </div>
      <div style={row}>
        <CrIconButton label="Notifications" variant="secondary" badge={unread || undefined} tooltipPlacement="bottom" onClick={() => setUnread((n) => n + 1)}>
          <Icon d={bell} />
        </CrIconButton>
        <CrIconButton label="Modifier XS" size="xs">
          <Icon d={pencil} />
        </CrIconButton>
        <CrIconButton label="Modifier S" size="s">
          <Icon d={pencil} />
        </CrIconButton>
        <CrIconButton label="Modifier M">
          <Icon d={pencil} />
        </CrIconButton>
        <CrIconButton label="Modifier L" size="l" variant="primary">
          <Icon d={pencil} />
        </CrIconButton>
        <CrIconButton label="Supprimer" disabled>
          <Icon d={trash} />
        </CrIconButton>
        <CrIconButton label="Enregistrement" loading>
          <Icon d={pencil} />
        </CrIconButton>
      </div>
    </>
  );
}
