'use client';

import { useState } from 'react';
import { CrBox, CrSlider } from '@cristal/react';

export default function SliderBasic() {
  const [budget, setBudget] = useState(800);

  return (
    <CrBox display="flex" direction="column" gap="lg" style={{ width: '100%', maxWidth: 360 }}>
      <CrSlider label="Volume" name="volume" value={40} />
      <CrSlider label="Maximum budget (€)" name="budget" min={0} max={2000} step={50} value={budget} onCrInput={(event) => setBudget(event.detail)} />
      <CrSlider label="Brightness (set by the system)" value={70} disabled />
      <p>Budget: €{budget.toLocaleString('en-US')}</p>
    </CrBox>
  );
}
