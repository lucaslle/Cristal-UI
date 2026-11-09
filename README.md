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
| `remote`, `loading` | `cr-select` | recherche côté serveur (avec `searchable`) : pas de filtre local, `onCrSearch` donne le texte tapé ; `loading` affiche « Recherche en cours… » |

Événements : `onCrInput` (`cr-input`, à chaque frappe), `onCrSearch` (`cr-select` avec `remote`, 300 ms après la dernière frappe) et `onCrChange` (tous). La valeur est dans `event.detail`.

```tsx
<CrSelect label="Pays" name="country" placeholder="Choisir un pays" required>
  <option value="fr">France</option>
  <option value="be">Belgique</option>
</CrSelect>
```

### Modale et panneau latéral : `cr-dialog`, `cr-drawer`

Basés sur l'élément natif `<dialog>` : focus piégé dans la fenêtre, fermeture avec Échap, focus rendu au bouton d'ouverture, défilement de la page bloqué.

| Propriété | Description |
|---|---|
| `open` | ouvert ou fermé |
| `label` | titre affiché, et nom de la fenêtre pour les lecteurs d'écran (obligatoire) |
| `closeLabel` | libellé du bouton de fermeture, `Fermer` par défaut |
| `placement` | `cr-drawer` seulement : `end` (droite, par défaut) ou `start` (gauche) |

Contenu dans le slot par défaut, boutons d'action dans `slot="footer"`. L'événement `onCrClose` est émis à chaque fermeture (Échap, bouton Fermer, `open` à `false`). Largeur du drawer : variable CSS `--cr-drawer-width` (400px par défaut).

```tsx
<CrDialog label="Supprimer le produit ?" open={open} onCrClose={() => setOpen(false)}>
  <p>Cette action est définitive.</p>
  <CrButton slot="footer" variant="secondary" onClick={() => setOpen(false)}>Annuler</CrButton>
  <CrButton slot="footer" onClick={remove}>Supprimer</CrButton>
</CrDialog>
```

### `cr-card`

Conteneur avec `slot="header"`, contenu par défaut et `slot="footer"`. L'en-tête et le pied ne sont affichés que s'ils sont fournis.

## Développement

```bash
pnpm install
pnpm build
pnpm --filter playground-next start
pnpm --filter playground-next test:e2e
pnpm --filter docs dev
```

Le site de documentation (`docs/`) est publié sur GitHub Pages à chaque fusion sur `main`.
