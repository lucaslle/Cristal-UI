import type { CSSProperties } from 'react';
import { CrBackground, CrBox } from '@cristal/react';

const block: CSSProperties = { padding: '32px 24px 56px', borderRadius: 'var(--cr-radius-l)' };

export default function BackgroundColors() {
  return (
    <CrBox display="grid" columns="260px" gap="lg">
      <div className="cr-theme" style={{ '--cr-color-primary': '#e11d48' } as CSSProperties}>
        <CrBackground variant="aurora" style={block}>
          <strong>Thème rose</strong>
          <p>Les couleurs suivent la couleur principale du thème.</p>
        </CrBackground>
      </div>
      <CrBackground
        variant="waves"
        style={
          {
            ...block,
            '--cr-background-base': '#f0fdfa',
            '--cr-background-color-1': '#0284c7',
            '--cr-background-color-2': '#059669',
            '--cr-background-color-3': '#0d9488',
          } as CSSProperties
        }
      >
        <strong>Couleurs choisies</strong>
        <p>Les trois couleurs sont données en CSS.</p>
      </CrBackground>
    </CrBox>
  );
}
