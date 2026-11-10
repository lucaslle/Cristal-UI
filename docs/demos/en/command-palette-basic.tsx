'use client';

import { useState } from 'react';
import { CrBox, CrButton, CrCommandPalette } from '@cristal/react';

export default function CommandPaletteBasic() {
  const [open, setOpen] = useState(false);
  const [command, setCommand] = useState('');

  return (
    <CrBox display="flex" gap="sm" align="center">
      <CrButton variant="outline" onClick={() => setOpen(true)}>
        Commands
      </CrButton>
      <span>{command && `Chosen command: ${command}`}</span>
      <CrCommandPalette label="Command palette" shortcut={false} open={open} onCrSelect={(event) => setCommand(event.detail)} onCrClose={() => setOpen(false)}>
        <option value="home" data-group="Go to">
          Home
        </option>
        <option value="orders" data-group="Go to">
          My orders
        </option>
        <option value="settings" data-group="Go to">
          Settings
        </option>
        <option value="invoice" data-group="Actions">
          Create an invoice
        </option>
        <option value="export" data-group="Actions">
          Export as CSV
        </option>
        <option value="logout" data-group="Actions">
          Sign out
        </option>
      </CrCommandPalette>
    </CrBox>
  );
}
