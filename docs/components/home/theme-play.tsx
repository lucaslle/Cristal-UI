'use client';

import { useState, type CSSProperties } from 'react';
import { CrButton, CrCheckbox, CrIconButton, CrInput, CrStep, CrStepper } from '@cristal/react';
import { Sparkles } from 'lucide-react';

const colors = [
  ['Améthyste', '#6d28d9'],
  ['Framboise', '#e11d48'],
  ['Émeraude', '#059669'],
  ['Océan', '#0369a1'],
  ['Ambre', '#f59e0b'],
  ['Encre', '#111827'],
] as const;

/** Une couleur choisie ici repeint tous les composants : survol, fond clair, texte lisible et focus sont calculés. */
export function ThemePlay() {
  const [color, setColor] = useState<string>(colors[0][1]);
  return (
    <section className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 py-24 lg:grid-cols-2">
      <div className="flex flex-col gap-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-fd-primary">Thème</p>
        <h2 className="font-display text-4xl font-bold sm:text-5xl">Votre marque, en une seule ligne.</h2>
        <p className="text-lg text-fd-muted-foreground">
          Donnez votre couleur : les nuances de survol, les fonds clairs, le texte lisible dessus et le contour de focus suivent, en gardant un contraste suffisant.
        </p>
        <fieldset className="flex flex-wrap gap-3">
          <legend className="mb-3 font-semibold">Couleur principale</legend>
          {colors.map(([name, value]) => (
            <label key={value} className="flex cursor-pointer items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-4 has-[:checked]:border-fd-primary has-[:checked]:ring-2 has-[:checked]:ring-fd-primary has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2">
              <input type="radio" name="brand" value={value} checked={color === value} onChange={() => setColor(value)} className="sr-only" />
              <span className="size-7 rounded-full" style={{ background: value }} aria-hidden="true" />
              {name}
            </label>
          ))}
        </fieldset>
        <pre className="overflow-x-auto rounded-2xl bg-[#0b0718] p-5 font-mono text-sm text-violet-100">
          <span className="text-fuchsia-300">:root</span> {'{'}
          {'\n'}  <span className="text-cyan-300">--cr-color-primary</span>: {color};{'\n'}
          {'}'}
        </pre>
      </div>
      <div className="glass flex flex-col gap-5 p-8" style={{ '--cr-color-primary': color } as CSSProperties}>
        <CrStepper label="Profil" variant="path" current={1}>
          <CrStep label="Compte">Compte créé.</CrStep>
          <CrStep label="Profil">Présentez-vous en quelques mots.</CrStep>
          <CrStep label="Fin">Tout est prêt.</CrStep>
        </CrStepper>
        <CrInput label="Nom d'affichage" value="Camille" />
        <CrCheckbox label="Profil public" checked />
        <div className="flex flex-wrap items-center gap-3">
          <CrButton>Enregistrer</CrButton>
          <CrButton variant="secondary">Aperçu</CrButton>
          <CrButton variant="outline">Annuler</CrButton>
          <CrIconButton label="Suggestions" variant="secondary" shape="round" badge={3}>
            <Sparkles aria-hidden="true" />
          </CrIconButton>
        </div>
      </div>
    </section>
  );
}
