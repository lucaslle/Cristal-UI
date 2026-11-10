'use client';

import { useState } from 'react';
import { CrBox, CrButton, CrCommandPalette } from '@cristal/react';

export default function CommandPaletteBasic() {
  const [open, setOpen] = useState(false);
  const [command, setCommand] = useState('');

  return (
    <CrBox display="flex" gap="sm" align="center">
      <CrButton variant="outline" onClick={() => setOpen(true)}>
        Commandes
      </CrButton>
      <span>{command && `Commande choisie : ${command}`}</span>
      <CrCommandPalette label="Palette de commandes" shortcut={false} open={open} onCrSelect={(event) => setCommand(event.detail)} onCrClose={() => setOpen(false)}>
        <option value="accueil" data-group="Aller à">
          Accueil
        </option>
        <option value="commandes" data-group="Aller à">
          Mes commandes
        </option>
        <option value="parametres" data-group="Aller à">
          Paramètres
        </option>
        <option value="facture" data-group="Actions">
          Créer une facture
        </option>
        <option value="export" data-group="Actions">
          Exporter en CSV
        </option>
        <option value="deconnexion" data-group="Actions">
          Se déconnecter
        </option>
      </CrCommandPalette>
    </CrBox>
  );
}
