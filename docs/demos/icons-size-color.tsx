'use client';

import type { CSSProperties } from 'react';
import { CrBox, CrIconBell, CrIconHeart, CrIconSearch, CrIconStar } from '@cristal-ui/react';

export default function IconsSizeColor() {
  return (
    <CrBox display="flex" direction="column" gap="lg" align="start">
      <CrBox display="flex" gap="lg" align="center">
        <CrIconSearch size={16} />
        <CrIconSearch size={20} />
        <CrIconSearch />
        <CrIconSearch size={32} />
        <CrIconSearch size="3rem" />
      </CrBox>
      <CrBox display="flex" gap="lg" align="center">
        <CrIconHeart color="#e11d48" label="Favori" />
        <CrIconStar color="var(--cr-color-primary)" label="Mis en avant" />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#059669' }}>
          <CrIconBell /> suit la couleur du texte
        </span>
      </CrBox>
      <CrBox display="flex" gap="lg" align="center" style={{ '--cr-icon-size': '40px' } as CSSProperties}>
        <CrIconBell />
        <CrIconHeart />
        <CrIconStar />
      </CrBox>
    </CrBox>
  );
}
