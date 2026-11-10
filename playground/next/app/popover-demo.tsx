'use client';

import { useState } from 'react';
import { CrButton, CrCheckbox, CrInput, CrPopover } from '@cristal/react';

export function PopoverDemo() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState('');

  return (
    <div style={{ display: 'flex', gap: 'var(--cr-spacing-lg)', alignItems: 'center' }}>
      <CrPopover label="Partager" open={open} onCrToggle={(event) => setOpen(event.detail)}>
        <div style={{ display: 'grid', gap: 'var(--cr-spacing-lg)', width: 280 }}>
          <CrInput label="Adresse du destinataire" type="email" />
          <CrCheckbox label="Autoriser la modification" />
          <CrButton
            onClick={() => {
              setSent('Invitation envoyée');
              setOpen(false);
            }}
          >
            Inviter
          </CrButton>
        </div>
      </CrPopover>
      <p data-testid="popover-state">{sent}</p>
    </div>
  );
}
