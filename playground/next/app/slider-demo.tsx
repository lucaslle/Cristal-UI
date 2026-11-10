'use client';

import { useState } from 'react';
import { CrSlider } from '@cristal/react';

export function SliderDemo() {
  const [volume, setVolume] = useState(40);

  return (
    <div style={{ display: 'grid', gap: 'var(--cr-spacing-lg)', maxWidth: 320 }}>
      <form data-testid="slider-form">
        <CrSlider label="Volume" name="volume" step={5} value={volume} onCrInput={(event) => setVolume(event.detail)} />
      </form>
      <p data-testid="slider-value">{volume}</p>
      <CrSlider label="Luminosité" value={70} disabled />
    </div>
  );
}
