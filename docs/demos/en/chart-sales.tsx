'use client';

import { useState } from 'react';
import { CrChart, CrSegmented } from '@cristal/react';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const sales = [12400, 15800, 14100, 18900, 21300, 19700, 24800, 22100, 26500, 25200, 29800, 34100];
const returns = [900, 1100, 1300, 1000, 1500, 1200, 1700, 1400, 1600, 2100, 1800, 2400];

export default function ChartSales() {
  const [type, setType] = useState('column');

  return (
    <div style={{ display: 'grid', gap: 16, width: '100%' }}>
      <CrSegmented label="Chart type" value={type} onCrChange={(event) => setType(event.detail)}>
        <option value="column">Columns</option>
        <option value="line">Lines</option>
        <option value="area">Areas</option>
      </CrSegmented>
      <CrChart
        label="Sales and returns"
        type={type as 'column' | 'line' | 'area'}
        labels={months}
        series={[
          { name: 'Sales', values: sales },
          { name: 'Returns', values: returns },
        ]}
        format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
      />
    </div>
  );
}
