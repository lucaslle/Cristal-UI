import { CrStep, CrStepper } from '@cristal/react';

const styles = [
  ['number', 'Big Number'],
  ['path', 'Skill Path'],
  ['blocks', 'Level Blocks'],
  ['gauge', 'Gauge Arc'],
] as const;

export default function StepperStyles() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32, width: '100%' }}>
      {styles.map(([variant, name]) => (
        <CrStepper key={variant} variant={variant} label={name} navigation>
          <CrStep label="Account">Email address and password.</CrStep>
          <CrStep label="Profile">Name and photo.</CrStep>
          <CrStep label="Plan">Plan selection.</CrStep>
          <CrStep label="Finish">Review.</CrStep>
        </CrStepper>
      ))}
    </div>
  );
}
