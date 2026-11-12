import type React from 'react';
import { CrAccordion, CrAccordionItem, CrButton, CrIconButton, CrCard, CrCheckbox, CrInput, CrSegmented, CrSelect, CrTabPanel } from '@cristal/react/ssr';
import { AccordionDemo } from './accordion-demo';
import { StepperDemo } from './stepper-demo';
import { SearchDemo } from './search-demo';
import { SegmentedDemo } from './segmented-demo';
import { SwitchDemo } from './switch-demo';
import { RadioGroupDemo } from './radio-group-demo';
import { SliderDemo } from './slider-demo';
import { DatePickerDemo } from './date-picker-demo';
import { RatingDemo } from './rating-demo';
import { AvatarDemo } from './avatar-demo';
import { BadgeDemo } from './badge-demo';
import { BackgroundDemo } from './background-demo';
import { WeatherDemo } from './weather-demo';
import { PaginationDemo } from './pagination-demo';
import { BreadcrumbDemo } from './breadcrumb-demo';
import { SparklineDemo } from './sparkline-demo';
import { NumberDemo } from './number-demo';
import { AlertDemo } from './alert-demo';
import { EmptyStateDemo } from './empty-state-demo';
import { FileUploadDemo } from './file-upload-demo';
import { LoadingDemo } from './loading-demo';
import { TableDemo } from './table-demo';
import { FieldsDemo } from './fields-demo';
import { OtpDemo } from './otp-demo';
import { QuantityDemo } from './quantity-demo';
import { FieldErrorDemo } from './field-error-demo';
import { GridLayoutDemo } from './grid-layout-demo';
import { FormDemo } from './form-demo';
import { MenuDemo } from './menu-demo';
import { SelectDemo } from './select-demo';
import { RemoteSelectDemo } from './remote-select-demo';
import { OverlayDemo } from './overlay-demo';
import { CommandPaletteDemo } from './command-palette-demo';
import { EnglishDemo } from './english-demo';
import { IconButtonDemo } from './icon-button-demo';
import { TooltipDemo } from './tooltip-demo';
import { PopoverDemo } from './popover-demo';
import { ThemeToggleDemo } from './theme-toggle-demo';

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
        <CrIconButton label="Paramètres" variant="secondary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" />
          </svg>
        </CrIconButton>
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
        <CrButton href="/?lien" variant="outline">Lien vers l'accueil</CrButton>
        <CrButton href="/?lien" disabled>Lien désactivé</CrButton>
      </div>

      <h2>Boutons icône</h2>
      <IconButtonDemo />

      <h2>Infobulles</h2>
      <TooltipDemo />

      <h2>Fenêtre contextuelle</h2>
      <PopoverDemo />

      <h2>Thème local</h2>
      <div className="cr-theme" data-testid="local-theme" style={{ ...row, '--cr-color-primary': '#e11d48' } as React.CSSProperties}>
        <CrButton>Thème rose</CrButton>
        <CrButton variant="secondary">Secondaire rose</CrButton>
      </div>

      <h2>Bascule de thème</h2>
      <ThemeToggleDemo />

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

      <h2>Recherche</h2>
      <SearchDemo />

      <h2>Contrôle segmenté</h2>
      <SegmentedDemo />
      <CrSegmented data-testid="ssr-tabs" label="Conditions" variant="outline" value="1">
        <CrTabPanel label="Livraison">Livraison offerte dès 50 €.</CrTabPanel>
        <CrTabPanel label="Retours">Retour gratuit sous 30 jours.</CrTabPanel>
      </CrSegmented>

      <h2>Interrupteurs</h2>
      <SwitchDemo />

      <h2>Boutons radio</h2>
      <RadioGroupDemo />

      <h2>Curseurs</h2>
      <SliderDemo />

      <h2>Sélecteur de date</h2>
      <DatePickerDemo />

      <h2>Notation</h2>
      <RatingDemo />

      <h2>Dépôt de fichiers</h2>
      <FileUploadDemo />

      <h2>Avatars</h2>
      <AvatarDemo />

      <h2>Pastilles</h2>
      <BadgeDemo />

      <h2>Fonds animés</h2>
      <BackgroundDemo />

      <h2 id="meteo">Cartes météo</h2>
      <WeatherDemo />

      <h2>Fil d'Ariane</h2>
      <BreadcrumbDemo />

      <h2>Pagination</h2>
      <PaginationDemo />

      <h2>Mini-graphiques</h2>
      <SparklineDemo />

      <h2>Nombres animés</h2>
      <NumberDemo />

      <h2>Bandeaux et notifications</h2>
      <AlertDemo />

      <h2>États vides</h2>
      <EmptyStateDemo />

      <h2>Chargement</h2>
      <LoadingDemo />

      <h2>Grille déplaçable</h2>
      <GridLayoutDemo />

      <h2>Champs animés</h2>
      <FieldsDemo />
      <OtpDemo />

      <h2>Sélecteurs de quantité</h2>
      <QuantityDemo />

      <h2>Erreurs animées</h2>
      <FieldErrorDemo />

      <h2>Tableau</h2>
      <TableDemo />

      <h2>Menus</h2>
      <MenuDemo />

      <h2>Modale et drawer</h2>
      <OverlayDemo />

      <h2>Palette de commandes</h2>
      <CommandPaletteDemo />

      <h2 lang="en">In English</h2>
      <EnglishDemo />
    </main>
  );
}
