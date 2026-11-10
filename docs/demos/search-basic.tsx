'use client';

import { useState } from 'react';
import { CrSearch } from '@cristal/react';

const products = ['Lampe', 'Chaise', 'Tapis', 'Canapé', 'Vase', 'Horloge'];

export default function SearchBasic() {
  const [query, setQuery] = useState('');
  const found = products.filter((product) => product.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <CrSearch
      label="Rechercher un produit"
      placeholder="Rechercher"
      placeholderWords={['une lampe', 'une chaise', 'un tapis']}
      recent={['lampe', 'chaise', 'tapis']}
      value={query}
      noResults={found.length === 0}
      onCrInput={(event) => setQuery(event.detail)}
      style={{ width: '100%', maxWidth: 420 }}
    >
      {query && found.length > 0 && (
        <ul>
          {found.map((product) => (
            <li key={product}>{product}</li>
          ))}
        </ul>
      )}
    </CrSearch>
  );
}
