'use client';

import { CrBox, CrKbd } from '@cristal/react';

export default function KbdBasic() {
  return (
    <CrBox display="flex" direction="column" gap="sm" align="start">
      <p style={{ margin: 0 }}>
        Ouvrez la palette de commandes avec <CrKbd keys="Mod+K" />, puis validez avec <CrKbd>Entrée</CrKbd>.
      </p>
      <p style={{ margin: 0 }}>
        Annuler la dernière action : <CrKbd keys="Mod+Z" /> ; la rétablir : <CrKbd keys="Mod+Shift+Z" />.
      </p>
    </CrBox>
  );
}
