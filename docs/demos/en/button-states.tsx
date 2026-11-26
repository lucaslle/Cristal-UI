import { CrButton } from '@cristal-ui/react';

export default function ButtonStates() {
  return (
    <>
      <CrButton disabled>Disabled</CrButton>
      <CrButton loading>Saving</CrButton>
    </>
  );
}
