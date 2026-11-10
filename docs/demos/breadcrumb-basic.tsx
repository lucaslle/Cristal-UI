import { CrBox, CrBreadcrumb } from '@cristal/react';

export default function BreadcrumbBasic() {
  return (
    <CrBox display="flex" direction="column" gap="lg">
      <CrBreadcrumb>
        <a href="/docs">Accueil</a>
        <a href="/docs/composants/bouton">Composants</a>
        <span>Fil d'Ariane</span>
      </CrBreadcrumb>
      <CrBreadcrumb>
        <a href="/docs">Accueil</a>
        <a href="/docs">Boutique</a>
        <a href="/docs">Maison</a>
        <a href="/docs">Cuisine</a>
        <a href="/docs">Ustensiles</a>
        <span>Fouet inox</span>
      </CrBreadcrumb>
    </CrBox>
  );
}
