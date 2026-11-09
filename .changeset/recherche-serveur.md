---
"@cristal/core": minor
"@cristal/react": minor
---

cr-select gains opt-in server-side search: with `remote` (alongside `searchable`) the list no longer filters locally and emits `crSearch` 300 ms after the last keystroke; `loading` shows and announces "Recherche en cours…". Chosen options keep their label in the button when they leave the results.
