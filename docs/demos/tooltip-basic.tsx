import { CrButton, CrTooltip } from '@cristal/react';

export default function TooltipBasic() {
  return (
    <>
      <CrTooltip text="Copie l'adresse de la page">
        <CrButton variant="outline">Copier le lien</CrButton>
      </CrTooltip>
      <CrTooltip text="À compter de la date de livraison" placement="bottom">
        <a href="#accessibilite">Retours sous 30 jours</a>
      </CrTooltip>
    </>
  );
}
