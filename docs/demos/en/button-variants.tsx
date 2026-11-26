import { CrButton } from '@cristal-ui/react';

export default function ButtonVariants() {
  return (
    <>
      <CrButton>Primary</CrButton>
      <CrButton variant="secondary">Secondary</CrButton>
      <CrButton variant="outline">Outline</CrButton>
      <CrButton variant="link">Link</CrButton>
    </>
  );
}
