---
"@cristal/core": minor
"@cristal/react": minor
---

Add cr-command-palette: a modal dialog (native dialog) opened with Ctrl+K / ⌘K (shortcut, on by default) or open, holding a combobox that filters child option elements, accent and case insensitive, grouped under headings with data-group. Up/Down (skipping disabled commands), Enter and Escape follow the APG combobox pattern with aria-activedescendant; "No results" reuses cr-empty-state in a status region; focus goes back to where it was on close. Emits crSelect and crClose. The dialog drops in with a spring and the active highlight slides between rows; neither moves when less motion is requested. readOptions now also reads data-group.
