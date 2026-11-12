---
"@cristal/core": minor
"@cristal/react": minor
---

Add cr-background, a container that shows its content on top of a decorative animated background in the theme colours: aurora (default), gradient, grid, dots and waves in CSS, particles in a canvas. The colours derive from the primary colour and can be overridden with --cr-background-color-1/2/3 and --cr-background-base. The animated layer is hidden from screen readers and in forced colours; a pause button (aria-pressed, hidden with controls={false}) and the paused prop stop it, it starts paused when less motion is requested, and it stops off screen or in a hidden tab. The server HTML already shows a still frame.
