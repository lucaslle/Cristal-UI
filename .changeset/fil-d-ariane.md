---
"@cristal/core": minor
"@cristal/react": minor
---

Add cr-breadcrumb: write the levels as plain children (`<a href>` links, then the current page), and the component puts them in an ordered list inside a navigation landmark named "Breadcrumb", marks the last one with aria-current="page" and draws decorative separators. Links stay native light-DOM links. Beyond max levels (4 by default) the middle ones collapse behind a "…" button with aria-expanded; revealing them moves focus to the first revealed link, and they slide out of the ellipsis one after the other (no slide when less motion is requested).
