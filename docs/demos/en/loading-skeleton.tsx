import { CrBox, CrSkeleton } from '@cristal/react';

export default function LoadingSkeleton() {
  return (
    <CrBox display="flex" gap="lg" padding="lg" background="surface" radius="l" border aria-busy="true" style={{ width: '100%', maxWidth: 420 }}>
      <CrSkeleton shape="block" width="120px" height="88px" />
      <CrBox display="flex" direction="column" gap="sm" style={{ flex: 1 }}>
        <CrSkeleton width="90%" />
        <CrSkeleton width="70%" />
        <CrSkeleton width="45%" />
      </CrBox>
    </CrBox>
  );
}
