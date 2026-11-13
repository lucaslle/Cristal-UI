'use client';

import { useState } from 'react';
import { CrButton, CrChart } from '@cristal/react';

const MONTHS = ['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];
const sales = [12400, 15800, 14100, 18900, 21300, 19700, 24800, 22100, 26500, 25200, 29800, 34100];
const returns = [900, 1100, 1300, 1000, 1500, 1200, 1700, 1400, 1600, 2100, 1800, 2400];
const visits = Array.from({ length: 30 }, (_, i) => Math.round(800 + i * 22 + Math.sin(i / 2) * 140));
const euros = { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 } as const;

export function ChartDemo() {
  const [half, setHalf] = useState(false);
  const months = half ? MONTHS.slice(6) : MONTHS;
  const pick = (values: number[]) => (half ? values.slice(6) : values);

  return (
    <div style={{ display: 'grid', gap: 'var(--cr-spacing-2xl, 32px)' }}>
      <CrButton variant="outline" onClick={() => setHalf(!half)} style={{ justifySelf: 'start' }}>
        {half ? 'Toute l’année' : 'Second semestre'}
      </CrButton>
      <CrChart label="Ventes et retours" labels={months} series={[{ name: 'Ventes', values: pick(sales) }, { name: 'Retours', values: pick(returns) }]} format={euros} />
      <CrChart label="Visites des 30 derniers jours" type="area" labels={visits.map((_, i) => `${i + 1} nov.`)} series={[{ name: 'Visites', values: visits }]} />
      <CrChart
        label="Ventes par canal"
        type="line"
        labels={MONTHS}
        series={[
          { name: 'Web', values: sales.map((v) => Math.round(v * 0.55)) },
          { name: 'Boutique', values: sales.map((v, i) => Math.round(v * (0.35 - i * 0.01))) },
          { name: 'Grossiste', values: sales.map((v, i) => Math.round(v * (0.1 + i * 0.01))) },
        ]}
        format={euros}
      />
      <CrChart label="Top produits" type="bar" labels={['Bureau réglable', 'Chaise ergonomique', 'Lampe articulée', 'Étagère murale', 'Câble USB-C']} series={[{ name: 'Ventes', values: [48200, 39100, 21800, 12500, 4300] }]} format={euros} />
      <CrChart
        label="Répartition par région"
        type="donut"
        labels={['Nord', 'Sud', 'Est', 'Ouest', 'Centre', 'Côte', 'Montagne', 'Outre-mer']}
        series={[{ name: 'Commandes', values: [420, 380, 260, 240, 120, 90, 40, 20] }]}
      />
      <CrChart label="Sans données" labels={[]} series={[]} />
    </div>
  );
}
