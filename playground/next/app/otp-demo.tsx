'use client';

import { useState } from 'react';
import { CrOtp } from '@cristal/react';

const animations = ['pop', 'bounce', 'stretch', 'spin', 'merge', 'zoom', 'tint'] as const;

export function OtpDemo() {
  const [complete, setComplete] = useState<Record<string, string>>({});

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--cr-spacing-xl)', marginTop: 'var(--cr-spacing-xl)' }}>
      {animations.map((animation) => (
        <div key={animation} data-testid={`otp-${animation}`}>
          <CrOtp label={`Code, animation ${animation}`} animation={animation} onCrComplete={(event) => setComplete((current) => ({ ...current, [animation]: event.detail }))} />
          <p role="status">{complete[animation] && `Complet : ${complete[animation]}`}</p>
        </div>
      ))}
    </div>
  );
}
