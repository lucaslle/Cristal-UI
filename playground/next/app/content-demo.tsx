'use client';

import { useState } from 'react';
import { CrButton, CrCodeBlock, CrConfirm, CrHoverCard, CrKbd } from '@cristal/react';

export function ContentDemo() {
  const [files, setFiles] = useState(['rapport.pdf', 'devis.docx']);

  return (
    <div style={{ display: 'grid', gap: 'var(--cr-spacing-lg)' }}>
      <p>
        Raccourci <CrKbd keys="Mod+Shift+K" data-testid="kbd-combo" /> ou touche <CrKbd>Entrée</CrKbd>.
      </p>
      <div style={{ display: 'grid', gap: 'var(--cr-spacing-sm)', justifyItems: 'start' }}>
        {files.map((file) => (
          <CrConfirm key={file} question={`Supprimer ${file} ?`} confirmLabel="Supprimer" onCrConfirm={() => setFiles((all) => all.filter((name) => name !== file))}>
            <CrButton size="s" variant="outline">
              Supprimer {file}
            </CrButton>
          </CrConfirm>
        ))}
      </div>
      <div>
        Modifié par{' '}
        <CrHoverCard openDelay={200}>
          <a href="#mia">Mia Laurent</a>
          <div slot="card">Designer produit à Lyon</div>
        </CrHoverCard>
        .
      </div>
      <CrCodeBlock label="Terminal" code="pnpm add @cristal/react" />
    </div>
  );
}
