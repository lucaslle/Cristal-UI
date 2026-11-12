'use client';

import { useState, useSyncExternalStore } from 'react';
import { CrAvatar, CrBox, CrSegmented, CrSwitch, CrThemeToggle } from '@cristal/react';

const transitions = [
  ['circle', 'Circle'],
  ['curtain', 'Curtain'],
  ['blinds', 'Blinds'],
  ['flip', 'Flip'],
  ['eclipse', 'Eclipse'],
  ['sweep', 'Sweep'],
] as const;

// The displayed theme, read again on every change of data-theme on <html>, wherever it comes from.
const subscribe = (update: () => void) => {
  const observer = new MutationObserver(update);
  observer.observe(document.documentElement, { attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
};
const pageTheme = () => document.documentElement.dataset.theme;

export default function ThemeToggleProfile() {
  const [index, setIndex] = useState(0);
  const theme = useSyncExternalStore(subscribe, pageTheme, () => undefined);

  return (
    <CrBox display="flex" direction="column" gap="lg" align="stretch">
      <CrSegmented label="Transition" value={String(index)} onCrChange={(event) => setIndex(Number(event.detail))}>
        {transitions.map(([transition, label], value) => (
          <option key={transition} value={value}>
            {label}
          </option>
        ))}
      </CrSegmented>
      <section aria-label="Profile" style={{ position: 'relative', width: '100%', maxWidth: 360, margin: '0 auto', padding: 24, boxSizing: 'border-box', background: 'var(--cr-color-surface)', border: '1px solid var(--cr-color-border)', borderRadius: 'var(--cr-radius-l)' }}>
        <CrThemeToggle transition={transitions[index][0]} style={{ position: 'absolute', top: 16, right: 16 }} />
        <CrBox display="flex" direction="column" gap="lg">
          <CrBox display="flex" gap="lg" align="center">
            <CrAvatar name="Léa Simon" size="l" />
            <div>
              <strong>Léa Simon</strong>
              <p style={{ margin: 0, color: 'var(--cr-color-text-muted)' }}>@lea.simon</p>
            </div>
          </CrBox>
          <p style={{ display: 'flex', justifyContent: 'space-between', margin: 0 }}>
            Appearance <span style={{ color: 'var(--cr-color-text-muted)' }}>{theme === 'dark' ? 'Dark' : 'Light'} ›</span>
          </p>
          <CrSwitch label="Notifications" checked />
        </CrBox>
      </section>
    </CrBox>
  );
}
