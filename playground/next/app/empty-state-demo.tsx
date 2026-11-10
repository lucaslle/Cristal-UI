import { CrButton, CrEmptyState } from '@cristal/react';

export function EmptyStateDemo() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--cr-spacing-lg)' }}>
      <CrEmptyState data-testid="empty-search" heading="Aucun produit trouvé" illustration="search">
        Essayez un autre mot ou retirez des filtres.
        <CrButton slot="actions" size="s" href="/?catalogue">
          Voir tout le catalogue
        </CrButton>
      </CrEmptyState>
      <CrEmptyState data-testid="empty-inbox" heading="Aucune facture" illustration="inbox">
        Vos factures apparaîtront ici après votre première commande.
      </CrEmptyState>
      <CrEmptyState data-testid="empty-plain" heading="Rien à afficher" />
    </div>
  );
}
