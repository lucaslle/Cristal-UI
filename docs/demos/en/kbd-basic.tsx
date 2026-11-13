'use client';

import { CrBox, CrKbd } from '@cristal/react';

export default function KbdBasic() {
  return (
    <CrBox display="flex" direction="column" gap="sm" align="start">
      <p style={{ margin: 0 }}>
        Open the command palette with <CrKbd keys="Mod+K" />, then confirm with <CrKbd>Enter</CrKbd>.
      </p>
      <p style={{ margin: 0 }}>
        Undo the last action: <CrKbd keys="Mod+Z" />; redo it: <CrKbd keys="Mod+Shift+Z" />.
      </p>
    </CrBox>
  );
}
