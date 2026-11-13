'use client';

import { useRef, useState } from 'react';
import { CrBox, CrButton, CrGridLayout, CrGridItem, CrSegmented } from '@cristal/react';
import { Activity, Conversion, Revenue, Tasks, Visits } from './grid-layout-items';

const extras = [
  { id: 'latence', label: 'Latence', w: 3, h: 2 },
  { id: 'commandes', label: 'Commandes', w: 4, h: 2 },
  { id: 'alertes', label: 'Alertes', w: 3, h: 2 },
];
const settings = {
  variant: ['card', 'elevated', 'soft', 'outline', 'glass'],
  resizeHandle: ['corner', 'knob', 'edges'],
  grab: ['surface', 'hold', 'handle'],
} as const;
const labels = { variant: 'Apparence', resizeHandle: 'Agrandir', grab: 'Attraper' };
// Fond coloré pour que le verre dépoli se voie.
const backdrop = 'radial-gradient(circle at 15% 20%, #c4b5fd, transparent 45%), radial-gradient(circle at 85% 70%, #f9a8d4, transparent 45%), #e0f2fe';

type Settings = { [K in keyof typeof settings]: (typeof settings)[K][number] };

export function GridLayoutDemo() {
  const dashboard = useRef<HTMLCrGridLayoutElement>(null);
  const [added, setAdded] = useState<typeof extras>([]);
  const [layout, setLayout] = useState('');
  const [look, setLook] = useState<Settings>({ variant: 'card', resizeHandle: 'corner', grab: 'surface' });
  const item = { variant: look.variant, resizeHandle: look.resizeHandle };

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
      <CrBox display="flex" gap="lg" wrap>
        {(Object.keys(settings) as (keyof Settings)[]).map((key) => (
          <CrSegmented key={key} label={labels[key]} value={look[key]} onCrChange={(event) => setLook((current) => ({ ...current, [key]: event.detail }))}>
            {settings[key].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </CrSegmented>
        ))}
      </CrBox>
      <div style={{ padding: 16, borderRadius: 16, background: look.variant === 'glass' ? backdrop : undefined }}>
        <CrGridLayout ref={dashboard} label="Panneau d'opérations" grab={look.grab} storageKey="playground-grid" onCrLayoutChange={(event) => setLayout(JSON.stringify(event.detail))}>
          <CrGridItem {...item} id="revenus" label="Revenus" x={0} y={0} w={4} h={2}>
            <Revenue />
          </CrGridItem>
          <CrGridItem {...item} id="conversion" label="Conversion" x={9} y={0} w={3} h={2}>
            <Conversion />
          </CrGridItem>
          <CrGridItem {...item} id="visites" label="Visites par heure" x={0} y={2} w={5} h={2} minW={3}>
            <Visits />
          </CrGridItem>
          <CrGridItem {...item} id="taches" label="Tâches" x={5} y={2} w={4} h={2}>
            <Tasks />
          </CrGridItem>
          <CrGridItem {...item} id="activite" label="Activité" x={0} y={4} w={5} h={2}>
            <Activity />
          </CrGridItem>
          {added.map((extra) => (
            <CrGridItem {...item} key={extra.id} id={extra.id} label={extra.label} w={extra.w} h={extra.h} removable onCrRemove={() => setAdded((list) => list.filter((a) => a.id !== extra.id))}>
              Nouveau widget « {extra.label} »
            </CrGridItem>
          ))}
        </CrGridLayout>
      </div>
      <p data-testid="dashboard-layout">Disposition : {layout}</p>
    </CrBox>
  );
}
