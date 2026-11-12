'use client';

import { useState } from 'react';
import { CrBox, CrNumber, CrProgress, CrSegmented } from '@cristal/react';

const animations = [
  ['roll', 'Compteur'],
  ['flap', 'Volets'],
  ['blur', 'Flou'],
  ['stagger', 'Cascade'],
  ['decode', 'Décodage'],
  ['count', 'Comptage'],
] as const;

const days = [
  ['lun', 'Lun', 6482],
  ['mar', 'Mar', 8215],
  ['mer', 'Mer', 4307],
  ['jeu', 'Jeu', 10024],
] as const;

const GOAL = 10000;

export default function NumberSteps() {
  const [animation, setAnimation] = useState(0);
  const [day, setDay] = useState(0);
  const steps = days[day][2];

  return (
    <CrBox display="flex" direction="column" gap="xl" align="center">
      <CrSegmented label="Animation" value={String(animation)} onCrChange={(event) => setAnimation(Number(event.detail))}>
        {animations.map(([value, label], index) => (
          <option key={value} value={index}>
            {label}
          </option>
        ))}
      </CrSegmented>
      <div style={{ width: '100%', maxWidth: 360, padding: 24, borderRadius: 'var(--cr-radius-l)', background: 'var(--cr-color-surface)', boxShadow: 'var(--cr-shadow-m)' }}>
        <CrSegmented label="Jour" value={String(day)} onCrChange={(event) => setDay(Number(event.detail))}>
          {days.map(([value, label], index) => (
            <option key={value} value={index}>
              {label}
            </option>
          ))}
        </CrSegmented>
        <p style={{ margin: '24px 0 0', color: 'var(--cr-color-text-muted)' }}>Pas du jour</p>
        <p style={{ margin: '0 0 16px' }}>
          <CrNumber value={steps} animation={animations[animation][0]} style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.1 }} /> pas
        </p>
        <CrProgress label="Objectif de 10 000 pas" value={Math.min(100, (steps / GOAL) * 100)} />
      </div>
    </CrBox>
  );
}
