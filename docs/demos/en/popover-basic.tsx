'use client';

import { useState } from 'react';
import { CrButton, CrCheckbox, CrInput, CrPopover } from '@cristal/react';

export default function PopoverBasic() {
  const [open, setOpen] = useState(false);

  return (
    <CrPopover label="Share" open={open} onCrToggle={(event) => setOpen(event.detail)}>
      <div style={{ display: 'grid', gap: 'var(--cr-spacing-lg)', width: 280 }}>
        <CrInput label="Recipient address" type="email" />
        <CrCheckbox label="Allow editing" />
        <CrButton onClick={() => setOpen(false)}>Invite</CrButton>
      </div>
    </CrPopover>
  );
}
