'use client';

import { useState } from 'react';
import { CrBox, CrButton, CrInput, CrSegmented } from '@cristal/react';

const animations = [
  ['zigzag', 'Zigzag'],
  ['pop', 'Badge'],
  ['drop', 'Sign'],
  ['echo', 'Echo'],
  ['jitter', 'Letters'],
  ['wobble', 'Jelly'],
] as const;

export default function InputErrorAnimation() {
  const [animation, setAnimation] = useState(0);
  const [sent, setSent] = useState('');

  return (
    <CrBox display="flex" direction="column" gap="xl" align="center">
      <CrSegmented label="Error animation" fit value={String(animation)} onCrChange={(event) => setAnimation(Number(event.detail))}>
        {animations.map(([value, label], index) => (
          <option key={value} value={index}>
            {label}
          </option>
        ))}
      </CrSegmented>
      <form
        style={{ display: 'grid', gap: 24, width: 'min(100%, 360px)', boxSizing: 'border-box', padding: 32, borderRadius: 'var(--cr-radius-l)', background: 'var(--cr-color-surface)', boxShadow: 'var(--cr-shadow-m)' }}
        onSubmit={(event) => {
          event.preventDefault();
          setSent(String(new FormData(event.currentTarget).get('email')));
        }}
      >
        <div>
          <h3 style={{ margin: 0 }}>Create your account</h3>
          <p style={{ margin: '4px 0 0', color: 'var(--cr-color-text-muted)' }}>We will send you a sign-in link.</p>
        </div>
        <CrInput label="Email" name="email" type="email" autocomplete="email" required errorAnimation={animations[animation][0]} onCrInput={() => setSent('')} />
        <CrButton type="submit" fullWidth>
          Continue
        </CrButton>
        <p role="status" style={{ margin: 0 }}>
          {sent && `Link sent to ${sent}.`}
        </p>
      </form>
    </CrBox>
  );
}
