'use client';

import { useRef, useState } from 'react';
import { CrSelect } from '@cristal/react';

const communes = [
  { code: '75001', name: 'Paris' },
  { code: '69001', name: 'Lyon' },
  { code: '13001', name: 'Marseille' },
  { code: '59000', name: 'Lille' },
  { code: '33000', name: 'Bordeaux' },
  { code: '44000', name: 'Nantes' },
  { code: '67000', name: 'Strasbourg' },
  { code: '31000', name: 'Toulouse' },
];

// Fausse API : cherche dans le nom et le code postal, avec un délai réseau.
const fetchCommunes = (query: string) =>
  new Promise<typeof communes>((resolve) =>
    setTimeout(() => resolve(communes.filter((c) => `${c.name} ${c.code}`.toLowerCase().includes(query.toLowerCase())).slice(0, 5)), 400),
  );

export function RemoteSelectDemo() {
  const [results, setResults] = useState(communes.slice(0, 5));
  const [loading, setLoading] = useState(false);
  const [calls, setCalls] = useState<string[]>([]);
  const [chosen, setChosen] = useState<string[]>([]);
  const last = useRef('');

  const search = async (query: string) => {
    last.current = query;
    setCalls((list) => [...list, query]);
    setLoading(true);
    const found = await fetchCommunes(query);
    if (last.current !== query) return;
    setResults(found);
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cr-spacing-lg)', maxWidth: 400 }}>
      <CrSelect
        label="Communes"
        hint="Nom ou code postal"
        placeholder="Choisir des communes"
        multiple
        searchable
        remote
        loading={loading}
        values={chosen}
        onCrSearch={(event) => search(event.detail)}
        onCrChange={(event) => setChosen(event.detail as string[])}
      >
        {results.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name} ({c.code})
          </option>
        ))}
      </CrSelect>
      <p data-testid="remote-calls">Appels : {calls.join(' | ')}</p>
    </div>
  );
}
