'use client';

import { useState } from 'react';
import { CrAlert, CrButton } from '@cristal/react';

export function AlertDemo() {
  const [closed, setClosed] = useState(0);
  const [late, setLate] = useState(false);

  return (
    <div style={{ display: 'grid', gap: 'var(--cr-spacing-sm)' }}>
      <CrAlert data-testid="alert-info" heading="Nouvelle version">
        La version 2.4 ajoute l'export en PDF.
      </CrAlert>
      <CrAlert data-testid="alert-success" variant="success">
        Paiement reçu, merci.
      </CrAlert>
      <CrAlert data-testid="alert-warning" variant="warning" heading="Stock bas">
        Il reste 3 articles en réserve.
      </CrAlert>
      <CrAlert data-testid="alert-danger" variant="danger" heading="Synchronisation impossible" dismissible onCrClose={() => setClosed((count) => count + 1)}>
        Vérifiez votre connexion puis réessayez.
      </CrAlert>
      <p data-testid="alert-closed">{closed}</p>
      {late && (
        <CrAlert data-testid="alert-late" variant="success">
          Export terminé.
        </CrAlert>
      )}
      <CrButton size="s" variant="secondary" style={{ justifySelf: 'start' }} onClick={() => setLate(true)}>
        Lancer l'export
      </CrButton>
    </div>
  );
}
