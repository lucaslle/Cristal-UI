import { CrBox, CrButton } from '@cristal/react';

export default function BoxLayout() {
  return (
    <CrBox display="flex" direction="column" gap="lg" padding="xl" background="muted" radius="l" border style={{ width: '100%' }}>
      <CrBox display="flex" justify="space-between" align="center" wrap gap="sm">
        <strong>Projects</strong>
        <CrButton size="s">New project</CrButton>
      </CrBox>
      <CrBox display="grid" columns="160px" gap="sm">
        {['Marketing site', 'Mobile app', 'Dashboard', 'Online store'].map((name) => (
          <CrBox key={name} padding="lg" background="surface" radius="m" shadow>
            {name}
          </CrBox>
        ))}
      </CrBox>
    </CrBox>
  );
}
