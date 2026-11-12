'use client';

import { CrCardInput, CrIconButton, CrStep, CrStepper, CrTagInput } from '@cristal/react';
import { Bold, Heart, Italic, Underline } from 'lucide-react';
import { copyOf } from './copy';

/** Trois panneaux de verre inclinés, avec de vrais composants utilisables. */
export function HeroStage({ lang }: { lang: string }) {
  const c = copyOf(lang).stage;
  return (
    <div className="relative grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 lg:block lg:min-h-[650px]">
      <div className="cr-theme glass tilt tilt-left p-6 sm:col-span-2 lg:absolute lg:left-0 lg:top-0 lg:w-[400px]">
        <CrCardInput label={c.payment} variant="card" holder hint={c.tryCard} />
      </div>
      <div className="cr-theme glass tilt tilt-right p-6 lg:absolute lg:right-0 lg:top-24 lg:z-10 lg:w-[300px]">
        <CrStepper label={c.order} variant="gauge" navigation>
          {c.steps.map(([label, text]) => (
            <CrStep key={label} label={label}>
              {text}
            </CrStep>
          ))}
        </CrStepper>
      </div>
      <div className="cr-theme glass tilt tilt-left flex flex-col gap-4 p-5 lg:absolute lg:bottom-0 lg:left-16 lg:z-20 lg:w-[380px]">
        <div role="toolbar" aria-label={c.formatting} className="flex items-center gap-1">
          <CrIconButton label={c.bold} size="s" toggle pressed>
            <Bold aria-hidden="true" />
          </CrIconButton>
          <CrIconButton label={c.italic} size="s" toggle>
            <Italic aria-hidden="true" />
          </CrIconButton>
          <CrIconButton label={c.underline} size="s" toggle>
            <Underline aria-hidden="true" />
          </CrIconButton>
          <span className="ml-auto">
            <CrIconButton label={c.like} variant="secondary" shape="round" size="s" toggle badge={128}>
              <Heart aria-hidden="true" />
            </CrIconButton>
          </span>
        </div>
        <CrTagInput label={c.tags} values={c.tagValues} />
      </div>
    </div>
  );
}
