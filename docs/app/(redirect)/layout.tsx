import type { ReactNode } from 'react';

/** Pages de redirection sans habillage : l'accueil choisit la langue, les anciennes adresses /docs/… vont vers le français. */
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
