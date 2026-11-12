'use client';

import { useState } from 'react';
import { CrBox, CrNumber, CrProgress, CrSegmented } from '@cristal/react';

const animations = [
  ['roll', 'Roll'],
  ['flap', 'Flap'],
  ['blur', 'Blur'],
  ['stagger', 'Stagger'],
  ['decode', 'Decode'],
  ['count', 'Count'],
] as const;

const days = [
  ['mon', 'Mon', 6482],
  ['tue', 'Tue', 8215],
  ['wed', 'Wed', 4307],
  ['thu', 'Thu', 10024],
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
        <CrSegmented label="Day" value={String(day)} onCrChange={(event) => setDay(Number(event.detail))}>
          {days.map(([value, label], index) => (
            <option key={value} value={index}>
              {label}
            </option>
          ))}
        </CrSegmented>
        <p style={{ margin: '24px 0 0', color: 'var(--cr-color-text-muted)' }}>Steps today</p>
        <p style={{ margin: '0 0 16px' }}>
          <CrNumber value={steps} animation={animations[animation][0]} style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.1 }} /> steps
        </p>
        <CrProgress label="Goal of 10,000 steps" value={Math.min(100, (steps / GOAL) * 100)} />
      </div>
    </CrBox>
  );
}
