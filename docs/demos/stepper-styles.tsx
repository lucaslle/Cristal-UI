import { CrStep, CrStepper } from '@cristal/react';

const styles = [
  ['number', 'Big Number'],
  ['path', 'Skill Path'],
  ['blocks', 'Level Blocks'],
  ['gauge', 'Gauge Arc'],
] as const;

export default function StepperStyles() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32, width: '100%' }}>
      {styles.map(([variant, name]) => (
        <CrStepper key={variant} variant={variant} label={name} navigation>
          <CrStep label="Compte">Adresse e-mail et mot de passe.</CrStep>
          <CrStep label="Profil">Nom et photo.</CrStep>
          <CrStep label="Offre">Choix de la formule.</CrStep>
          <CrStep label="Fin">Vérification.</CrStep>
        </CrStepper>
      ))}
    </div>
  );
}
