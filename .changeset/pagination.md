---
"@cristal/core": minor
"@cristal/react": minor
---

Add cr-pagination: a navigation landmark named "Pagination" with previous and next arrows, page numbers named "Page 4", the current one marked with aria-current="page", and an ellipsis for long ranges (1 … 4 5 6 … 20). With an href template ("/products?page={page}") every page is a real link, so Ctrl/Cmd+click and middle click are native; without it, buttons emit crChange. The ringed highlight of the current page slides to the new number; no slide when less motion is requested.
