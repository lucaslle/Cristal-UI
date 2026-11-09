'use client';

import { useState } from 'react';
import { CrMenu } from '@cristal/react';

const animations = ['fade', 'anchor-pop', 'turn-over', 'card-deal', 'drum-roll', 'outline-trace', 'tile-build'] as const;

export function MenuDemo() {
  const [last, setLast] = useState('');

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--cr-spacing-lg)', alignItems: 'center' }}>
      {animations.map((animation) => (
        <CrMenu
          key={animation}
          label={animation}
          animation={animation}
          onCrSelect={(event) => setLast(`${event.detail} (${animation})`)}
        >
          <option value="edit">Modifier</option>
          <option value="duplicate">Dupliquer</option>
          <option value="archive" disabled>
            Archiver
          </option>
          <option value="delete">Supprimer</option>
        </CrMenu>
      ))}
      <p data-testid="menu-result">Action : {last}</p>
    </div>
  );
}
