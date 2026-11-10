'use client';

import { useState } from 'react';
import { CrButton, CrCheckbox, CrInput, CrPopover } from '@cristal/react';

export default function PopoverBasic() {
  const [open, setOpen] = useState(false);

  return (
    <CrPopover label="Partager" open={open} onCrToggle={(event) => setOpen(event.detail)}>
      <div style={{ display: 'grid', gap: 'var(--cr-spacing-lg)', width: 280 }}>
        <CrInput label="Adresse du destinataire" type="email" />
        <CrCheckbox label="Autoriser la modification" />
        <CrButton onClick={() => setOpen(false)}>Inviter</CrButton>
      </div>
    </CrPopover>
  );
}
