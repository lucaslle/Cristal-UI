---
"@cristal/core": minor
"@cristal/react": minor
---

cr-segmented gains a tabs mode: with cr-tab-panel children instead of option elements, it renders the W3C tabs pattern with automatic activation (arrow keys, Home, End, single Tab stop) and shows the chosen panel, which slides in from the side of the change (no slide when less motion is requested). `value` and `crChange` name the chosen tab by its panel's `value`, or else its position as a string; in this mode the control sends nothing with a form. All four variants and `fit` work in both modes, `underline` giving the classic tabs look. Other panels are hidden from the shadow DOM, so server rendering shows the right panel without a flash. Adds cr-tab-panel (`label`, `value`, default slot).
