'use client';

import type { CSSProperties } from 'react';
import { useState } from 'react';
import { CrBackground, CrBox, CrSegmented, CrWeather } from '@cristal/react';

const conditions = [
  ['rain', 'Light rain'],
  ['storm', 'Heavy rain'],
  ['fog', 'Fog'],
  ['frost', 'Frost'],
  ['heat', 'Heat'],
  ['clear', 'Clear'],
  ['wind', 'Wind'],
] as const;

// A vivid backdrop, like a blurred photo behind the card: colours picked by hand, in both themes.
const backdrop = {
  '--cr-background-base': '#6d28d9',
  '--cr-background-color-1': '#fb923c',
  '--cr-background-color-2': '#ec4899',
  '--cr-background-color-3': '#22d3ee',
  display: 'grid',
  placeItems: 'center',
  padding: '48px 16px',
  borderRadius: 'var(--cr-radius-l)',
} as CSSProperties;

const detail = { margin: 0, fontWeight: 600 };

export default function WeatherCard() {
  const [index, setIndex] = useState(0);
  const [condition, label] = conditions[index];

  return (
    <CrBox display="flex" direction="column" gap="lg" align="stretch">
      <CrSegmented label="Weather" value={String(index)} onCrChange={(event) => setIndex(Number(event.detail))}>
        {conditions.map(([value, text], position) => (
          <option key={value} value={position}>
            {text}
          </option>
        ))}
      </CrSegmented>
      <CrBackground variant="aurora" style={backdrop}>
        <CrWeather condition={condition} style={{ width: 'min(100%, 320px)', padding: '24px 24px 52px' }}>
          <h3 style={{ margin: 0, fontSize: 20 }}>Lyon</h3>
          <p style={{ margin: '2px 0 0' }}>Thursday, November 12</p>
          <p style={{ margin: '16px 0 0', fontSize: 64, lineHeight: 1, fontWeight: 300 }}>14°</p>
          <p style={{ margin: '4px 0 20px', fontSize: 18 }}>{label}</p>
          <dl style={{ display: 'flex', gap: 32, margin: 0 }}>
            <div>
              <dt>Humidity</dt>
              <dd style={detail}>82%</dd>
            </div>
            <div>
              <dt>Wind</dt>
              <dd style={detail}>12 km/h</dd>
            </div>
          </dl>
        </CrWeather>
      </CrBackground>
    </CrBox>
  );
}
