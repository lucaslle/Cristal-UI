'use client';

import { CrCardInput, CrIconButton, CrStep, CrStepper, CrTagInput } from '@cristal/react';
import { Bold, Heart, Italic, Underline } from 'lucide-react';

/** Trois panneaux de verre inclinés, avec de vrais composants utilisables. */
export function HeroStage() {
  return (
    <div className="relative grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 lg:block lg:min-h-[650px]">
      <div className="glass tilt tilt-left p-6 sm:col-span-2 lg:absolute lg:left-0 lg:top-0 lg:w-[400px]">
        <CrCardInput label="Paiement" variant="card" holder hint="Essayez : 4242 4242 4242 4242" />
      </div>
      <div className="glass tilt tilt-right p-6 lg:absolute lg:right-0 lg:top-24 lg:z-10 lg:w-[300px]">
        <CrStepper label="Commande" variant="gauge" navigation>
          <CrStep label="Panier">3 articles, livraison offerte.</CrStep>
          <CrStep label="Livraison">Retrait en point relais.</CrStep>
          <CrStep label="Paiement">Carte ou virement.</CrStep>
        </CrStepper>
      </div>
      <div className="glass tilt tilt-left flex flex-col gap-4 p-5 lg:absolute lg:bottom-0 lg:left-16 lg:z-20 lg:w-[380px]">
        <div role="toolbar" aria-label="Mise en forme" className="flex items-center gap-1">
          <CrIconButton label="Gras" size="s" toggle pressed>
            <Bold aria-hidden="true" />
          </CrIconButton>
          <CrIconButton label="Italique" size="s" toggle>
            <Italic aria-hidden="true" />
          </CrIconButton>
          <CrIconButton label="Souligné" size="s" toggle>
            <Underline aria-hidden="true" />
          </CrIconButton>
          <span className="ml-auto">
            <CrIconButton label="J'aime" variant="secondary" shape="round" size="s" toggle badge={128}>
              <Heart aria-hidden="true" />
            </CrIconButton>
          </span>
        </div>
        <CrTagInput label="Étiquettes" values={['accessible', 'animé', 'rapide']} />
      </div>
    </div>
  );
}
