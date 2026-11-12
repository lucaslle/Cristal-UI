---
"@cristal/core": minor
"@cristal/react": minor
---

Add cr-theme-toggle (React CrThemeToggle): a round button whose sun morphs into a moon (rays tuck in, a disc slides over to carve the crescent). A click sets data-theme on <html> and emits crChange with the new theme; the initial theme comes from data-theme, otherwise prefers-color-scheme, and later changes of data-theme made elsewhere are followed. transition animates the whole page with the View Transitions API: circle (default, from the button), curtain, blinds, flip, eclipse, sweep or none; the switch is instant where the API is missing or when less motion is requested. It is a real button with aria-pressed and a translated name ("Dark theme" / "Thème sombre"), a 40 px target, a visible focus, a 3:1 icon in both themes and system colours in forced colours. Keeping the choice is left to the application.
