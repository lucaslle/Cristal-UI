'use client';

import { useRef, useState } from 'react';
import { CrSelect } from '@cristal/react';

type Commune = { code: string; nom: string };

const popular: Commune[] = [
  { code: '75056', nom: 'Paris' },
  { code: '13055', nom: 'Marseille' },
  { code: '69123', nom: 'Lyon' },
  { code: '31555', nom: 'Toulouse' },
];

const fetchCommunes = async (query: string): Promise<Commune[]> => {
  const filter = /^\d+$/.test(query) ? `codePostal=${query}` : `nom=${encodeURIComponent(query)}`;
  const response = await fetch(`https://geo.api.gouv.fr/communes?${filter}&fields=nom,code&limit=8`);
  return response.ok ? response.json() : [];
};

export default function SelectRemote() {
  const [communes, setCommunes] = useState(popular);
  const [loading, setLoading] = useState(false);
  const latest = useRef('');

  const search = async (query: string) => {
    latest.current = query;
    if (!query) {
      setLoading(false);
      return setCommunes(popular);
    }
    setLoading(true);
    const found = await fetchCommunes(query).catch(() => []);
    if (latest.current !== query) return; // a newer search is in progress
    setCommunes(found);
    setLoading(false);
  };

  return (
    <CrSelect
      label="French town"
      name="commune"
      hint="Name or postcode"
      placeholder="Choose a town"
      searchable
      remote
      loading={loading}
      onCrSearch={(event) => search(event.detail)}
    >
      {communes.map((commune) => (
        <option key={commune.code} value={commune.code}>
          {commune.nom}
        </option>
      ))}
    </CrSelect>
  );
}
