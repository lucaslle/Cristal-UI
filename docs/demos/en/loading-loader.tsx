import { CrBox, CrLoader } from '@cristal/react';

export default function LoadingLoader() {
  return (
    <CrBox display="flex" gap="2xl" align="end">
      <CrLoader />
      <CrLoader variant="bounce" label="Loading messages…" style={{ fontSize: 24 }} />
    </CrBox>
  );
}
