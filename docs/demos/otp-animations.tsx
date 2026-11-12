'use client';

import { useState } from 'react';
import { CrBox, CrButton, CrOtp, CrSegmented } from '@cristal/react';

const animations = [
  ['pop', 'Pop'],
  ['bounce', 'Rebond'],
  ['stretch', 'Anneau'],
  ['spin', 'Rouleau'],
  ['merge', 'Fusion'],
  ['zoom', 'Zoom'],
  ['tint', 'Remplissage'],
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
          <h3 style={{ margin: 0 }}>Saisissez le code reçu</h3>
          <p style={{ margin: '4px 0 0', color: 'var(--cr-color-text-muted)' }}>Nous l'avons envoyé au 06 •• •• •• 42.</p>
        </div>
        {/* key : changer d'animation repart d'un code vide, pour la voir dès le premier chiffre. */}
        <CrOtp key={animation} label="Code de vérification" name="code" required animation={animations[animation][0]} onCrInput={() => setVerified('')} />
        <CrButton type="submit" fullWidth>
          Vérifier
        </CrButton>
        <p role="status" style={{ margin: 0 }}>
          {verified && `Code ${verified} vérifié.`}
        </p>
      </form>
    </CrBox>
  );
}
