'use client';

import { useState } from 'react';
import { CrBox, CrButton, CrSparkline } from '@cristal/react';

const random = () => Array.from({ length: 8 }, () => Math.round(20 + Math.random() * 80));

export default function SparklineBasic() {
  const [visits, setVisits] = useState([42, 48, 45, 60, 58, 71, 69, 84]);

  return (
    <CrBox display="flex" direction="column" gap="lg" align="start">
      <p>
        Ventes du mois <CrSparkline label="Ventes du mois" values={[120, 135, 128, 160, 152, 190]} />
      </p>
      <CrSparkline label="Visites par jour" variant="area" values={visits} style={{ width: 240, height: 64 }} />
      <CrButton size="s" variant="secondary" onClick={() => setVisits(random())}>
        Nouvelles données
      </CrButton>
    </CrBox>
  );
}
