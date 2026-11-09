import { CrStep, CrStepper } from '@cristal/react';

export default function StepperBasic() {
  return (
    <CrStepper label="Inscription" navigation style={{ width: '100%' }}>
      <CrStep label="Compte">Choisissez une adresse e-mail et un mot de passe.</CrStep>
      <CrStep label="Profil">Ajoutez votre nom et une photo.</CrStep>
      <CrStep label="Offre">Choisissez votre formule.</CrStep>
      <CrStep label="Fin">Vérifiez vos informations puis validez.</CrStep>
    </CrStepper>
  );
}
