# @cristal/core

Accessible web components (RGAA, WCAG AA) with a `cr-` prefix, built with Stencil. They work in any framework or none; React users install [`@cristal/react`](https://www.npmjs.com/package/@cristal/react) instead.

Documentation: https://lucaslle.github.io/Cristal-UI/

```bash
npm install @cristal/core @cristal/tokens
```

```js
import '@cristal/tokens/tokens.css';
import { defineCustomElements } from '@cristal/core/loader';

defineCustomElements();
```

```html
<cr-button>Save</cr-button>
```
