---
"@cristal-ui/core": patch
---

Server rendering (`@cristal-ui/react/ssr`) now works in Next.js apps with `cacheComponents` enabled, the create-next-app default. The hydrate script read the clock and `Math.random()` on every render (Stencil's mock document and some components), which made `next build` fail while prerendering. It now reads time from `performance` and uses a seeded random, so the server HTML is a fixed snapshot that the components refresh in the browser.
