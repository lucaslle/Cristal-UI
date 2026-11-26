'use client';

import { CrCardInput, CrIconButton, CrStep, CrStepper, CrTagInput } from '@cristal-ui/react';
import { Bold, Heart, Italic, Underline } from 'lucide-react';
import { copyOf } from './copy';
import { Crystal, CrystalLight } from './crystal';
import { Keys } from './keys';

/** Planche de spécimens : de vrais composants utilisables, sur une seule surface, sous la lumière du cristal. */
export function HeroStage({ lang }: { lang: string }) {
  const c = copyOf(lang);
  const s = c.stage;
  return (
    <div className="relative min-w-0 sm:pt-32">
      <Crystal className="absolute right-14 top-0 hidden w-[156px] sm:block" />
      <div className="home-panel relative grid min-w-0 grid-cols-1 gap-6 p-6 sm:grid-cols-[minmax(0,1fr)_240px] sm:p-8">
        <CrystalLight />
        <div className="min-w-0">
          <CrCardInput label={s.payment} variant="card" holder hint={s.tryCard} />
        </div>
        <div className="min-w-0">
          <CrStepper label={s.order} variant="gauge" navigation>
            {s.steps.map(([label, text]) => (
              <CrStep key={label} label={label}>
                {text}
              </CrStep>
            ))}
          </CrStepper>
        </div>
        <div className="flex min-w-0 flex-col gap-4 border-t pt-6 sm:col-span-2">
          <div role="toolbar" aria-label={s.formatting} className="flex items-center gap-1">
            <CrIconButton label={s.bold} size="s" toggle pressed>
              <Bold aria-hidden="true" />
            </CrIconButton>
            <CrIconButton label={s.italic} size="s" toggle>
              <Italic aria-hidden="true" />
            </CrIconButton>
            <CrIconButton label={s.underline} size="s" toggle>
              <Underline aria-hidden="true" />
            </CrIconButton>
            <span className="ml-auto">
              <CrIconButton label={s.like} variant="secondary" shape="round" size="s" toggle badge={128}>
                <Heart aria-hidden="true" />
              </CrIconButton>
            </span>
          </div>
          <CrTagInput label={s.tags} values={s.tagValues} />
        </div>
        <Keys label={c.keyboard} keys={s.keys} className="sm:col-span-2" />
      </div>
    </div>
  );
}
