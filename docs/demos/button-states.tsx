import { CrButton } from '@cristal-ui/react';

export default function ButtonStates() {
  return (
    <>
      <CrButton disabled>Désactivé</CrButton>
      <CrButton loading>Enregistrement</CrButton>
    </>
  );
}
