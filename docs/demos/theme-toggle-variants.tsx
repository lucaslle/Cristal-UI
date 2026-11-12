'use client';

import { CrBox, CrThemeToggle } from '@cristal/react';

export default function ThemeToggleVariants() {
  return (
    <CrBox display="flex" gap="xl" align="center" justify="center" wrap>
      <CrThemeToggle variant="icon" />
      <CrThemeToggle variant="switch" />
      <CrThemeToggle variant="label" />
    </CrBox>
  );
}
