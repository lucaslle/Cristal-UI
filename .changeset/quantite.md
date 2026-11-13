---
"@cristal/core": minor
"@cristal/react": minor
---

Add cr-quantity, a form-associated quantity picker: a number between round − and + buttons in a pill, following the APG spinbutton pattern (arrows, Page Up/Down, Home/End, typed numbers committed on Enter or blur and clamped). Props: label, name, value, min, max, step, hint, error, required, disabled, error-animation and animation: press (default, the button squishes and the number pops up), slide (the number slides in from the tapped side), ripple (a ripple from the button reveals the number), stretch (the pill stretches toward the button, the number wobbles), spin (the glyph turns half a turn, the number flips over) or halo (a glow ring bursts, the number zooms down). Range, step and required errors are translated; the buttons are named after the label, stay focusable with aria-disabled at the bounds, and button changes are announced through a polite live region. crInput fires on every new value, crChange on every committed one. Nothing moves when less motion is requested, and numbers never fade in from transparent.
