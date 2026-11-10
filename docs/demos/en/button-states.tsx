import { CrButton } from '@cristal/react';

export default function ButtonStates() {
  return (
    <>
      <CrButton disabled>Disabled</CrButton>
      <CrButton loading>Saving</CrButton>
    </>
  );
}
