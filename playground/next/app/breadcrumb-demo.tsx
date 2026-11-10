import { CrBreadcrumb } from '@cristal/react';

export function BreadcrumbDemo() {
  return (
    <div style={{ display: 'grid', gap: 'var(--cr-spacing-lg)' }}>
      <CrBreadcrumb data-testid="breadcrumb-short">
        <a href="/?accueil">Accueil</a>
        <a href="/?docs">Documentation</a>
        <span>Bouton</span>
      </CrBreadcrumb>
      <CrBreadcrumb data-testid="breadcrumb-long">
        <a href="/?accueil">Accueil</a>
        <a href="/?boutique">Boutique</a>
        <a href="/?maison">Maison</a>
        <a href="/?cuisine">Cuisine</a>
        <a href="/?ustensiles">Ustensiles</a>
        <span>Fouet inox</span>
      </CrBreadcrumb>
    </div>
  );
}
