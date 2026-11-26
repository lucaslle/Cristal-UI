# @cristal-ui/react

Accessible React and Next.js components (RGAA, WCAG AA): 50+ components with a `cr-` prefix, server rendering, light and dark themes, English and French built-in texts.

Documentation: https://lucaslle.github.io/Cristal-UI/

```bash
npm install @cristal-ui/react
```

Import the tokens once, at the root of the app:

```tsx
import '@cristal-ui/react/tokens.css';
import { CrButton } from '@cristal-ui/react';

<CrButton onClick={save}>Save</CrButton>;
```

In Next.js server components, import from `@cristal-ui/react/ssr` to render the components on the server.
