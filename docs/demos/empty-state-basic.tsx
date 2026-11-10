'use client';

import { CrBox, CrButton, CrEmptyState } from '@cristal/react';

export default function EmptyStateBasic() {
  return (
    <CrBox display="flex" direction="column" gap="lg">
      <CrEmptyState heading="Aucun produit trouvé" illustration="search">
        Essayez un autre mot ou retirez des filtres.
        <CrButton slot="actions" variant="outline">
          Retirer les filtres
        </CrButton>
      </CrEmptyState>
      <CrEmptyState heading="Aucune facture" illustration="inbox">
        Vos factures apparaîtront ici après votre première commande.
        <CrButton slot="actions" href="/docs">
          Voir le catalogue
        </CrButton>
      </CrEmptyState>
      <CrEmptyState heading="Impossible de charger les commandes" illustration="error">
        Le serveur ne répond pas. Réessayez dans quelques instants.
        <CrButton slot="actions" variant="secondary">
          Réessayer
        </CrButton>
      </CrEmptyState>
    </CrBox>
  );
}
