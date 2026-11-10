'use client';

import { useRef } from 'react';
import { CrButton, CrDashboard, CrWidget } from '@cristal/react';

export default function DashboardBasic() {
  const dashboard = useRef<HTMLCrDashboardElement>(null);

  return (
    <div style={{ width: '100%' }}>
      <CrButton size="s" variant="secondary" onClick={() => dashboard.current?.reset()}>
        Reset
      </CrButton>
      <CrDashboard ref={dashboard} label="Sales dashboard" columns={6} rowHeight={70} storageKey="docs-dashboard-en" style={{ marginTop: 16 }}>
        <CrWidget id="ventes" label="Sales" x={0} y={0} w={2} h={2}>
          <strong style={{ fontSize: 26 }}>$48,920</strong>
        </CrWidget>
        <CrWidget id="clients" label="New customers" x={2} y={0} w={2} h={2}>
          <strong style={{ fontSize: 26 }}>312</strong>
        </CrWidget>
        <CrWidget id="panier" label="Average order" x={4} y={0} w={2} h={2}>
          <strong style={{ fontSize: 26 }}>$64</strong>
        </CrWidget>
        <CrWidget id="notes" label="Notes" x={0} y={2} w={4} h={2} minW={2}>
          Drag a widget by its handle, pull its corner to resize it.
        </CrWidget>
      </CrDashboard>
    </div>
  );
}
