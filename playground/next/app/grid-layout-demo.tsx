'use client';

import { useRef, useState } from 'react';
import { CrBox, CrButton, CrGridLayout, CrGridItem } from '@cristal/react';
import { Activity, Conversion, Revenue, Tasks, Visits } from './grid-layout-items';

const extras = [
  { id: 'latence', label: 'Latence', w: 3, h: 2 },
  { id: 'commandes', label: 'Commandes', w: 4, h: 2 },
  { id: 'alertes', label: 'Alertes', w: 3, h: 2 },
];

export function GridLayoutDemo() {
  const dashboard = useRef<HTMLCrGridLayoutElement>(null);
  const [added, setAdded] = useState<typeof extras>([]);
  const [layout, setLayout] = useState('');

  return (
    <CrBox display="grid" columns="1" gap="lg">
      <CrBox display="flex" gap="sm" wrap align="center">
        {extras.map((extra) => (
          <CrButton key={extra.id} size="s" variant="secondary" disabled={added.some((a) => a.id === extra.id)} onClick={() => setAdded((list) => [...list, extra])}>
            Ajouter « {extra.label} »
          </CrButton>
        ))}
        <CrButton size="s" variant="outline" onClick={() => dashboard.current?.reset()}>
          Restaurer
        </CrButton>
      </CrBox>
      <CrGridLayout ref={dashboard} label="Panneau d'opérations" storageKey="playground-grid" onCrLayoutChange={(event) => setLayout(JSON.stringify(event.detail))}>
        <CrGridItem id="revenus" label="Revenus" x={0} y={0} w={4} h={2}>
          <Revenue />
        </CrGridItem>
        <CrGridItem id="conversion" label="Conversion" x={9} y={0} w={3} h={2}>
          <Conversion />
        </CrGridItem>
        <CrGridItem id="visites" label="Visites par heure" x={0} y={2} w={5} h={2} minW={3}>
          <Visits />
        </CrGridItem>
        <CrGridItem id="taches" label="Tâches" x={5} y={2} w={4} h={2}>
          <Tasks />
        </CrGridItem>
        <CrGridItem id="activite" label="Activité" x={0} y={4} w={5} h={2}>
          <Activity />
        </CrGridItem>
        {added.map((extra) => (
          <CrGridItem key={extra.id} id={extra.id} label={extra.label} w={extra.w} h={extra.h} removable onCrRemove={() => setAdded((list) => list.filter((a) => a.id !== extra.id))}>
            Nouveau widget « {extra.label} »
          </CrGridItem>
        ))}
      </CrGridLayout>
      <p data-testid="dashboard-layout">Disposition : {layout}</p>
    </CrBox>
  );
}
