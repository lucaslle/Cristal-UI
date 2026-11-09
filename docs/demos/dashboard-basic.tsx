'use client';

import { useRef } from 'react';
import { CrButton, CrDashboard, CrWidget } from '@cristal/react';

export default function DashboardBasic() {
  const dashboard = useRef<HTMLCrDashboardElement>(null);

  return (
    <div style={{ width: '100%' }}>
      <CrButton size="s" variant="secondary" onClick={() => dashboard.current?.reset()}>
        Restaurer
      </CrButton>
      <CrDashboard ref={dashboard} label="Tableau de bord des ventes" columns={6} rowHeight={70} storageKey="docs-dashboard" style={{ marginTop: 16 }}>
        <CrWidget id="ventes" label="Ventes" x={0} y={0} w={2} h={2}>
          <strong style={{ fontSize: 26 }}>48 920 €</strong>
        </CrWidget>
        <CrWidget id="clients" label="Nouveaux clients" x={2} y={0} w={2} h={2}>
          <strong style={{ fontSize: 26 }}>312</strong>
        </CrWidget>
        <CrWidget id="panier" label="Panier moyen" x={4} y={0} w={2} h={2}>
          <strong style={{ fontSize: 26 }}>64 €</strong>
        </CrWidget>
        <CrWidget id="notes" label="Notes" x={0} y={2} w={4} h={2} minW={2}>
          Glissez un widget par sa poignée, tirez son coin pour changer sa taille.
        </CrWidget>
      </CrDashboard>
    </div>
  );
}
