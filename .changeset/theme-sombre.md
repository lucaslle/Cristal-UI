---
"@cristal/tokens": minor
"@cristal/core": minor
"@cristal/react": minor
---

Add an opt-in dark theme. `@cristal/tokens/tokens-dark.css` (also shipped as `@cristal/react/tokens-dark.css`) gives dark values to surface, text, muted text, borders, disabled states, danger, success, overlay and shadow, and sets `color-scheme: dark`, under `:root[data-theme='dark']` and the `cr-theme-dark` class; nothing changes without them, whatever the system preference. The primary colour stays the brand colour; primary-text, focus and the new primary-indicator token (stars, slider, switch, radio, checkbox, loader, sparkline, drop zones) switch to a light shade of it, and primary-subtle mixes with the dark surface. Status texts of badges, chips, inputs, numbers and codes now use the new text-lightness tokens, so they stay readable in both themes, and the icon button badge text follows the danger colour. Text keeps 4.5:1 and borders, focus and indicators 3:1 in dark.
