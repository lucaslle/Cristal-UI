'use client';

import { useState } from 'react';
import { CrBox, CrButton, CrOtp, CrSegmented } from '@cristal/react';

const animations = [
  ['pop', 'Pop'],
  ['bounce', 'Bounce'],
  ['stretch', 'Stretch'],
  ['spin', 'Spin'],
  ['merge', 'Merge'],
  ['zoom', 'Zoom'],
  ['tint', 'Tint'],
] as const;

export default function OtpAnimations() {
  const [animation, setAnimation] = useState(0);
  const [verified, setVerified] = useState('');

  return (
    <CrBox display="flex" direction="column" gap="xl" align="center">
      <CrSegmented label="Animation" fit value={String(animation)} onCrChange={(event) => setAnimation(Number(event.detail))}>
        {animations.map(([value, label], index) => (
          <option key={value} value={index}>
            {label}
          </option>
        ))}
      </CrSegmented>
      <form
        style={{ display: 'grid', gap: 24, padding: 32, borderRadius: 'var(--cr-radius-l)', background: 'var(--cr-color-surface)', boxShadow: 'var(--cr-shadow-m)' }}
        onSubmit={(event) => {
          event.preventDefault();
          setVerified(String(new FormData(event.currentTarget).get('code')));
        }}
      >
        <div>
          <h3 style={{ margin: 0 }}>Enter the code we sent</h3>
          <p style={{ margin: '4px 0 0', color: 'var(--cr-color-text-muted)' }}>We sent it to •• •• •• 42.</p>
        </div>
        {/* key: switching animation starts again from an empty code, to see it from the first digit. */}
        <CrOtp key={animation} label="Verification code" name="code" required animation={animations[animation][0]} onCrInput={() => setVerified('')} />
        <CrButton type="submit" fullWidth>
          Verify
        </CrButton>
        <p role="status" style={{ margin: 0 }}>
          {verified && `Code ${verified} verified.`}
        </p>
      </form>
    </CrBox>
  );
}
