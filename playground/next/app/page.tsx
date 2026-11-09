import type React from 'react';
import { CrAccordion, CrAccordionItem, CrButton, CrCard, CrCheckbox, CrInput, CrSelect } from '@cristal/react/ssr';
import { AccordionDemo } from './accordion-demo';
import { StepperDemo } from './stepper-demo';
import { FormDemo } from './form-demo';
import { MenuDemo } from './menu-demo';
import { SelectDemo } from './select-demo';
import { RemoteSelectDemo } from './remote-select-demo';
import { OverlayDemo } from './overlay-demo';

const row = { display: 'flex', gap: 'var(--cr-spacing-sm)', alignItems: 'center', marginBottom: 'var(--cr-spacing-lg)' };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--cr-spacing-lg)' };

export default function Page() {
  return (
    <main>
      <h1>Cristal</h1>

      <h2>Boutons</h2>
      <div style={row}>
        <CrButton>Principal</CrButton>
        <CrButton variant="secondary">Secondaire</CrButton>
        <CrButton variant="outline">Contour</CrButton>
        <CrButton variant="link">Lien</CrButton>
      </div>
      <div style={row}>
        <CrButton size="xs">XS</CrButton>
        <CrButton size="s">S</CrButton>
        <CrButton size="m">M</CrButton>
        <CrButton size="l">L</CrButton>
      </div>
      <div style={row}>
        <CrButton disabled>Désactivé</CrButton>
        <CrButton loading>Chargement</CrButton>
      </div>

      <h2>Thème local</h2>
      <div className="cr-theme" data-testid="local-theme" style={{ ...row, '--cr-color-primary': '#e11d48' } as React.CSSProperties}>
        <CrButton>Thème rose</CrButton>
        <CrButton variant="secondary">Secondaire rose</CrButton>
      </div>

      <h2>États des champs</h2>
      <div style={grid}>
        <CrInput label="Nom" error="Le nom est obligatoire. Saisissez au moins 2 caractères." />
        <CrInput label="Référence" value="REF-001" disabled />
        <CrSelect label="Catégorie" hint="La catégorie détermine la TVA.">
          <option value="book">Livre</option>
          <option value="food">Alimentation</option>
        </CrSelect>
        <CrCheckbox label="Option indisponible" disabled />
      </div>

      <h2>Cartes</h2>
      <div style={grid}>
        <CrCard>
          <h3 slot="header">Clavier mécanique</h3>
          <p>Switches silencieux, rétroéclairage blanc.</p>
          <CrButton slot="footer" size="s" variant="outline">
            Voir le produit
          </CrButton>
        </CrCard>
        <CrCard>
          <p>Carte sans en-tête ni pied.</p>
        </CrCard>
      </div>

      <h2>Formulaire</h2>
      <FormDemo />

      <h2>Listes avancées</h2>
      <SelectDemo />

      <h2>Recherche côté serveur</h2>
      <RemoteSelectDemo />

      <h2>Accordéons</h2>
      <CrAccordion data-testid="ssr-accordion" numbered>
        <CrAccordionItem label="Livraison" open>
          Expédition sous 48 h.
        </CrAccordionItem>
        <CrAccordionItem label="Retours">30 jours pour changer d'avis.</CrAccordionItem>
      </CrAccordion>
      <AccordionDemo />

      <h2>Étapes</h2>
      <StepperDemo />

      <h2>Menus</h2>
      <MenuDemo />

      <h2>Modale et drawer</h2>
      <OverlayDemo />
    </main>
  );
}
