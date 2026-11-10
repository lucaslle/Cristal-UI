'use client';

import { useState } from 'react';
import { CrAlert, CrBox, CrButton } from '@cristal/react';

export default function AlertBasic() {
  const [error, setError] = useState(0);

  return (
    <CrBox display="flex" direction="column" gap="sm">
      <CrAlert heading="Nouvelle version">La version 2.4 ajoute l'export en PDF.</CrAlert>
      <CrAlert variant="success">Modifications enregistrées.</CrAlert>
      <CrAlert variant="warning" heading="Stock bas">
        Il reste 3 articles en réserve.
      </CrAlert>
      {error > 0 && (
        <CrAlert key={error} variant="danger" heading="Envoi impossible" dismissible onCrClose={() => setError(0)}>
          Vérifiez votre connexion puis réessayez.
        </CrAlert>
      )}
      <CrButton variant="outline" onClick={() => setError((count) => count + 1)}>
        Envoyer
      </CrButton>
    </CrBox>
  );
}
