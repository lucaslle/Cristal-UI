---
"@cristal/core": minor
"@cristal/react": minor
---

cr-dialog and cr-drawer now close when the dimmed background next to them is clicked; set closeOnBackdrop to false to prevent it. The press must also start outside, so a text selection that ends outside or a keyboard click does not close it.
