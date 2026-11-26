import type { ReactNode } from 'react';
import '@cristal-ui/react/tokens.css';
import '@cristal-ui/react/tokens-dark.css';

export const metadata = { title: 'Cristal — playground Next' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ fontFamily: 'var(--cr-font-family)', padding: 'var(--cr-spacing-xl)', color: 'var(--cr-color-text)', background: 'var(--cr-color-surface)' }}>{children}</body>
    </html>
  );
}
