---
"@cristal/core": patch
"@cristal/react": patch
---

cr-table renders large row sets 100 rows at a time and adds more while scrolling, with aria-rowcount announcing the total. cr-grid-item makes its body focusable (region named by the item label) when the content overflows, so it can be scrolled from the keyboard.
