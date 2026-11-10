'use client';

import { useState } from 'react';
import { CrLoader, CrSearch } from '@cristal/react';

const products = ['Lampe', 'Chaise', 'Tapis'];

export function SearchDemo() {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const found = products.filter((product) => product.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div style={{ display: 'grid', gap: 'var(--cr-spacing-lg)', maxWidth: 420 }}>
      <CrSearch
        label="Rechercher un produit"
        placeholder="Rechercher"
        placeholderWords={['une lampe', 'une chaise', 'un tapis']}
        recent={['lampe', 'tapis']}
        value={query}
        noResults={found.length === 0}
        onCrInput={(event) => setQuery(event.detail)}
        onCrSubmit={(event) => setSubmitted(event.detail)}
      >
        {query && found.length > 0 && (
          <ul aria-label="Résultats">
            {found.map((product) => (
              <li key={product}>{product}</li>
            ))}
          </ul>
        )}
      </CrSearch>
      <p data-testid="search-submitted">{submitted}</p>
      <CrSearch label="Recherche teintée" variant="filled" placeholder="Rechercher" />
      <CrSearch label="Recherche soulignée" variant="underline" placeholder="Rechercher" />
      <CrSearch label="Recherche dépliable" variant="expand" placeholder="Rechercher" />
      <CrLoader variant="search" label="Recherche en cours…" />
    </div>
  );
}
