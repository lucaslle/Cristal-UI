# Cristal

Bibliothèque de Web Components (Stencil) utilisable dans React et Next.js, préfixe `cr-`.

Documentation : https://lucaslle.github.io/Cristal-UI/

## Installation

```bash
npm install @cristal/react @cristal/tokens
```

Importer les tokens une seule fois, à la racine de l'application (`app/layout.tsx` avec Next, `main.tsx` avec React) :

```tsx
import '@cristal/tokens/tokens.css';
```

## Thème

Une ligne suffit pour donner votre couleur à toute l'application ; les nuances (survol, fond clair, texte lisible, focus) sont calculées automatiquement :

```css
:root {
  --cr-color-primary: #e11d48;
}
```

Pour un thème limité à une zone : classe `cr-theme` sur le conteneur et `--cr-color-primary` redéfinie dessus. Un générateur avec vérification des contrastes est disponible sur la page « Thème » de la documentation.

## Langue

Les textes intégrés aux composants (messages d'erreur, boutons « Next », annonces pour les lecteurs d'écran…) sont en **anglais par défaut**. Ils passent en français dès que le composant ou un de ses parents porte `lang="fr"`, en général la page entière :

```html
<html lang="fr">
```

`lang` peut aussi être posé sur une seule zone (`<section lang="en">`) ou un seul composant.

## Utilisation

### React

```tsx
import { CrButton } from '@cristal/react';

<CrButton onClick={save}>Enregistrer</CrButton>
```

### Next.js

Dans un composant serveur, importer depuis `@cristal/react/ssr` : le composant est rendu côté serveur, sans flash au chargement.

```tsx
import { CrButton } from '@cristal/react/ssr';
```

Dans un composant client (`'use client'`), importer depuis `@cristal/react`.

## Composants

### `cr-button`

| Propriété | Valeurs | Défaut |
|---|---|---|
| `variant` | `primary`, `secondary`, `outline`, `link` | `primary` |
| `size` | `xs` (30px), `s` (36px), `m` (40px), `l` (48px) | `m` |
| `type` | `button`, `submit`, `reset` | `button` |
| `disabled` | booléen | `false` |
| `loading` | booléen | `false` |
| `fullWidth` | booléen | `false` |

Icônes : `slot="start"` (avant le texte) et `slot="end"` (après le texte).

### `cr-icon-button`

Bouton réduit à une icône (slot par défaut, avec `aria-hidden="true"`). `label` est obligatoire : il nomme le bouton et s'affiche en infobulle au survol et au focus clavier (Échap la masque).

| Propriété | Valeurs | Défaut |
|---|---|---|
| `label` | texte (obligatoire) | |
| `variant` | `ghost`, `primary`, `secondary`, `outline` | `ghost` |
| `size` | `xs` (30px), `s` (36px), `m` (40px), `l` (48px) | `m` |
| `shape` | `square`, `round` | `square` |
| `toggle`, `pressed` | bascule annoncée enfoncée ou non, `onCrToggle` | `false` |
| `badge` | pastille ajoutée au nom lu : « Notifications (3) » | |
| `tooltip`, `tooltipPlacement` | infobulle ; `top`, `bottom`, `start`, `end` | `true`, `top` |
| `type`, `disabled`, `loading` | comme `cr-button` | |

```tsx
<CrIconButton label="Ajouter aux favoris" toggle pressed={liked} onCrToggle={(e) => setLiked(e.detail)}>
  <Heart aria-hidden="true" />
</CrIconButton>
```

### Champs de formulaire : `cr-input`, `cr-select`, `cr-checkbox`

Ils participent au `<form>` parent comme des champs natifs (valeur envoyée, validation, réinitialisation). Le libellé est obligatoire et rendu par le composant. Les erreurs de saisie (champ obligatoire vide, e-mail mal formé…) s'affichent automatiquement en français ; `error` remplace le message automatique.

| Propriété | Composants | Description |
|---|---|---|
| `label` | tous | libellé (obligatoire) |
| `name` | tous | nom envoyé avec le formulaire |
| `value` | tous | valeur (`cr-checkbox` : valeur envoyée si cochée, `on` par défaut) |
| `hint` | tous | texte d'aide, lu par les lecteurs d'écran |
| `error` | tous | message d'erreur : bordure rouge, `aria-invalid`, lu par les lecteurs d'écran |
| `required`, `disabled` | tous | comme les champs natifs |
| `type` | `cr-input` | `text`, `email`, `password`, `number`, `tel`, `url`, `search` |
| `placeholder` | `cr-input`, `cr-select` | texte indicatif / texte affiché tant qu'aucune option n'est choisie |
| `autocomplete` | `cr-input` | comme le champ natif |
| `checked`, `indeterminate` | `cr-checkbox` | état de la case |
| `multiple`, `values` | `cr-select` | choix multiple ; `values` est le tableau des valeurs choisies |
| `searchable` | `cr-select` | champ de recherche en haut de la liste |
| `strength` | `cr-input` | jauge de sécurité du mot de passe |
| `completions` | `cr-input` | suggestions affichées en gris, acceptées avec flèche droite |
| `remote`, `loading` | `cr-select` | recherche côté serveur (avec `searchable`) : pas de filtre local, `onCrSearch` donne le texte tapé ; `loading` affiche « Recherche en cours… » |

Événements : `onCrInput` (`cr-input`, à chaque frappe), `onCrSearch` (`cr-select` avec `remote`, 300 ms après la dernière frappe) et `onCrChange` (tous). La valeur est dans `event.detail`.

```tsx
<CrSelect label="Pays" name="country" placeholder="Choisir un pays" required>
  <option value="fr">France</option>
  <option value="be">Belgique</option>
</CrSelect>
```

### Grille déplaçable : `cr-grid-layout`, `cr-grid-item`

Grille d'éléments (pour composer un tableau de bord, par exemple) déplacés par leur poignée (ou en maintenant le clic sur la carte) et redimensionnés par leur coin ; les autres s'écartent puis tout se tasse vers le haut. Au clavier : flèches pour déplacer, Maj + flèches pour la taille.

```tsx
<CrGridLayout columns={12} rowHeight={80} storageKey="mon-tableau" onCrLayoutChange={(e) => save(e.detail)}>
  <CrGridItem id="ventes" label="Ventes" x={0} y={0} w={4} h={2}>…</CrGridItem>
</CrGridLayout>
```

### Champs spécialisés

| Composant | Rôle |
|---|---|
| `cr-textarea` | texte sur plusieurs lignes qui grandit d'une ligne à la fois (`rows`, `maxRows`, slot `end`) |
| `cr-otp` | code à usage unique, une case par chiffre (`length`, `onCrComplete`) |
| `cr-card-input` | carte bancaire : numéro groupé, puis expiration et CVC (`name`, `name-expiry`, `name-cvc`) ; `preview` ajoute une carte dessinée qui se remplit et se retourne, `holder` le champ Titulaire ; `variant="card"` fait tout saisir directement sur la carte |
| `cr-tag-input` | étiquettes ajoutées avec Entrée ou virgule, retirées avec × (`values`, `onCrChange`) |

### Interrupteur : `cr-switch`

Active ou désactive un réglage, avec effet immédiat : case native avec `role="switch"`, `label` obligatoire, `name`, `value` (`on` par défaut), `checked`, `disabled`. La pastille s'étire en glissant et sa croix devient une coche. Événement `onCrChange`.

```tsx
<CrSwitch label="Notifications" name="notifications" checked={on} onCrChange={(event) => setOn(event.detail)} />
```

### Boutons radio : `cr-radio-group`

Choix d'une seule option dans une liste empilée : options en `option` enfants, `label` obligatoire (titre visible du groupe), `name`, `value` (aucune par défaut), `required`, `disabled`. Flèches pour changer d'option (une seule tabulation pour le groupe) ; le point coule de l'ancien cercle au nouveau. Événement `onCrChange`.

```tsx
<CrRadioGroup label="Mode de livraison" name="delivery" required value={delivery} onCrChange={(event) => setDelivery(event.detail)}>
  <option value="standard">Standard</option>
  <option value="express">Express</option>
</CrRadioGroup>
```

### Contrôle segmenté : `cr-segmented`

Choix d'une option parmi quelques-unes, côte à côte : options en `option` enfants (`data-count` ajoute un compteur), `label` obligatoire, `name`, `value`, `variant` (`thumb` par défaut, `clip`, `underline`, `outline`), `fit` (segments à la largeur de leur libellé), `disabled`. Événement `onCrChange`.

```tsx
<CrSegmented label="Période" value="month" onCrChange={(event) => setPeriod(event.detail)}>
  <option value="day">Jour</option>
  <option value="month" data-count="38">Mois</option>
</CrSegmented>
```

### Recherche : `cr-search`

Champ de recherche dont la loupe devient une flèche « Effacer » au focus : `label` obligatoire, `name`, `value`, `placeholder`, `variant` (`outline` par défaut, `filled`, `underline`, `expand`), `placeholderWords` (mots qui défilent dans le texte indicatif, au plus quatre fois), `recent` (recherches récentes en puces qui volent dans le champ), `noResults` (loupe qui secoue la tête et « ? »). Résultats dans le slot. Événements `onCrInput` et `onCrSubmit` (Entrée).

```tsx
<CrSearch label="Rechercher un produit" placeholder="Rechercher" placeholderWords={['une lampe', 'une chaise']} recent={['lampe']} value={query} noResults={!found.length} onCrInput={(event) => setQuery(event.detail)}>
  {results}
</CrSearch>
```

### Mise en page : `cr-box`

Remplaçant de `div` : `display`, `direction`, `gap`, `padding`, `align`, `justify`, `wrap`, `columns`, `background`, `radius`, `border`, `shadow`, `maxWidth`. Les espacements acceptent les valeurs du thème (`xs`, `sm`, `lg`, `xl`, `2xl`, `3xl`) ou toute valeur CSS.

```tsx
<CrBox display="grid" columns="220px" gap="lg" padding="xl">…</CrBox>
```

### Modale et panneau latéral : `cr-dialog`, `cr-drawer`

Basés sur l'élément natif `<dialog>` : focus piégé dans la fenêtre, fermeture avec Échap, focus rendu au bouton d'ouverture, défilement de la page bloqué.

| Propriété | Description |
|---|---|
| `open` | ouvert ou fermé |
| `label` | titre affiché, et nom de la fenêtre pour les lecteurs d'écran (obligatoire) |
| `closeLabel` | libellé du bouton de fermeture, « Close » par défaut (« Fermer » en français) |
| `placement` | `cr-drawer` seulement : `end` (droite, par défaut) ou `start` (gauche) |

Contenu dans le slot par défaut, boutons d'action dans `slot="footer"`. L'événement `onCrClose` est émis à chaque fermeture (Échap, bouton Fermer, `open` à `false`). Largeur du drawer : variable CSS `--cr-drawer-width` (400px par défaut).

```tsx
<CrDialog label="Supprimer le produit ?" open={open} onCrClose={() => setOpen(false)}>
  <p>Cette action est définitive.</p>
  <CrButton slot="footer" variant="secondary" onClick={() => setOpen(false)}>Annuler</CrButton>
  <CrButton slot="footer" onClick={remove}>Supprimer</CrButton>
</CrDialog>
```

### Notification : `cr-toast`, `cr-toaster`

Message temporaire : `cr-toaster` est une zone fixée en bas à droite qui empile les `cr-toast`. Un toast a `open`, `variant` (`info` par défaut, `success`, `danger` lu aussitôt) et `duration` (5000 ms par défaut, `0` pour qu'il reste) ; une barre montre le temps restant, qui s'arrête sous la souris ou le focus. Il se ferme avec le bouton Fermer, Échap ou en glissant sur le côté. Événement `onCrClose`.

```tsx
<CrToaster>
  {toasts.map((toast) => (
    <CrToast key={toast.id} open variant="success" onCrClose={() => remove(toast.id)}>Modifications enregistrées.</CrToast>
  ))}
</CrToaster>
```

### `cr-card`

Conteneur avec `slot="header"`, contenu par défaut et `slot="footer"`. L'en-tête et le pied ne sont affichés que s'ils sont fournis.

### Accordéon : `cr-accordion`, `cr-accordion-item`

| Propriété | Composant | Description |
|---|---|---|
| `multiple` | `cr-accordion` | plusieurs sections ouvertes à la fois |
| `variant` | `cr-accordion` | `list` (par défaut) ou `panels` (panneaux côte à côte) |
| `animation` | `cr-accordion` | `slide` (par défaut), `accent-bar`, `cascade` |
| `numbered`, `toggleAll`, `headingLevel` | `cr-accordion` | numéros 01, 02… ; bouton « Tout ouvrir / Tout fermer » ; niveau des titres (3 par défaut) |
| `label`, `open`, `disabled` | `cr-accordion-item` | titre ; section ouverte ; désactivée |

Contenu de la section dans le slot par défaut, valeur à droite du titre dans `slot="meta"`. `onCrToggle` est émis à chaque ouverture ou fermeture.

```tsx
<CrAccordion animation="accent-bar" numbered>
  <CrAccordionItem label="Conception" open>Maquettes validées.</CrAccordionItem>
  <CrAccordionItem label="Lancement">Mise en ligne.</CrAccordionItem>
</CrAccordion>
```

### Étapes : `cr-stepper`, `cr-step`

| Propriété | Composant | Description |
|---|---|---|
| `current` | `cr-stepper` | étape en cours (0 pour la première), vaut le nombre d'étapes quand tout est terminé |
| `variant` | `cr-stepper` | `line` (par défaut), `number`, `path`, `blocks`, `gauge`, `timeline` |
| `navigation` | `cr-stepper` | boutons « Précédent » et « Suivant » |
| `label` | `cr-stepper`, `cr-step` | nom de la progression ; nom de l'étape |

Méthodes `next()`, `previous()`, `goTo(index)` ; événements `onCrStepChange` et `onCrComplete`. Seul le contenu de l'étape en cours est affiché.

```tsx
<CrStepper label="Inscription" variant="gauge" navigation>
  <CrStep label="Compte">…</CrStep>
  <CrStep label="Profil">…</CrStep>
</CrStepper>
```

### Chargement : `cr-skeleton`, `cr-progress`, `cr-progress-steps`, `cr-loader`, `cr-image`

| Composant | Rôle |
|---|---|
| `cr-skeleton` | forme qui pulse à la place du contenu (`shape` : `line`, `block`, `circle` ; `width`, `height`) |
| `cr-progress` | barre de progression : indéterminée sans `value`, remplie jusqu'à `value` (0 à 100) sinon ; `showValue` affiche le pourcentage qui compte |
| `cr-progress-steps` | étapes d'un traitement (`steps`, `current`) : passées cochées, en cours avec un indicateur qui tourne |
| `cr-loader` | indicateur d'attente : `spinner` (par défaut), `bounce` ou `search` (loupe qui glisse) ; taille selon `font-size` |
| `cr-image` | image floue puis nette une fois chargée (`src`, `alt`) |

```tsx
<CrProgress label="Téléversement" value={40} showValue />
<CrProgressSteps steps={['Recherche', 'Lecture', 'Rédaction']} current={1} />
```

### Tableau : `cr-table`

Chaque utilisateur règle les colonnes : ordre (glisser un en-tête ou Alt + flèches), largeur (bord droit de l'en-tête ou Maj + flèches), colonnes fixées (F) et masquées (M ou menu « Colonnes »), densité des lignes et « Réinitialiser ».

| Propriété | Description |
|---|---|
| `label` | titre du tableau |
| `columns` | `{ key, label, width?, align?, pinned?, hidden?, badges? }[]` |
| `variant` | `default`, `striped`, `cards`, `minimal`, `grid` |
| `rows` | un objet par ligne, avec une valeur par `key` |
| `density` | `comfortable`, `normal` (par défaut), `compact` |
| `storageKey` | clé localStorage pour retenir les réglages |

Événement `onCrLayoutChange` avec la présentation dans `event.detail`. Les grandes listes s'affichent par paquets de 100 lignes pendant le défilement.

```tsx
<CrTable label="Commandes" columns={columns} rows={rows} storageKey="commandes" />
```

## Développement

```bash
pnpm install
pnpm build
pnpm --filter playground-next start
pnpm --filter playground-next test:e2e
pnpm --filter docs dev
```

Le site de documentation (`docs/`) est publié sur GitHub Pages à chaque fusion sur `main`.
