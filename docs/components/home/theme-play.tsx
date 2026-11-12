'use client';

import { useState, type CSSProperties } from 'react';
import { CrButton, CrCheckbox, CrIconButton, CrInput, CrStep, CrStepper } from '@cristal/react';
import { Sparkles } from 'lucide-react';
import { copyOf } from './copy';

const colors = ['#6d28d9', '#e11d48', '#059669', '#0369a1', '#f59e0b', '#111827'];

/** Une couleur choisie ici repeint tous les composants : survol, fond clair, texte lisible et focus sont calculés. */
export function ThemePlay({ lang }: { lang: string }) {
  const c = copyOf(lang);
  const p = c.preview;
  const [color, setColor] = useState(colors[0]);
  return (
    <section className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 py-24 lg:grid-cols-2">
      <div className="flex flex-col gap-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-fd-primary">{c.themeKicker}</p>
        <h2 className="font-display text-4xl font-bold sm:text-5xl">{c.themeTitle}</h2>
        <p className="text-lg text-fd-muted-foreground">{c.themeLead}</p>
        <fieldset className="flex flex-wrap gap-3">
          <legend className="mb-3 font-semibold">{c.themeLegend}</legend>
          {colors.map((value, index) => (
            <label key={value} className="flex cursor-pointer items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-4 has-[:checked]:border-fd-primary has-[:checked]:ring-2 has-[:checked]:ring-fd-primary has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2">
              <input type="radio" name="brand" value={value} checked={color === value} onChange={() => setColor(value)} className="sr-only" />
              <span className="size-7 rounded-full" style={{ background: value }} aria-hidden="true" />
              {c.colours[index]}
            </label>
          ))}
        </fieldset>
        <pre className="overflow-x-auto rounded-2xl bg-[#0b0718] p-5 font-mono text-sm text-violet-100">
          <span className="text-fuchsia-300">:root</span> {'{'}
          {'\n'}  <span className="text-cyan-300">--cr-color-primary</span>: {color};{'\n'}
          {'}'}
        </pre>
      </div>
      <div className="cr-theme glass flex flex-col gap-5 p-8" style={{ '--cr-color-primary': color } as CSSProperties}>
        <CrStepper label={p.stepper} variant="path" current={1}>
          {p.steps.map(([label, text]) => (
            <CrStep key={label} label={label}>
              {text}
            </CrStep>
          ))}
        </CrStepper>
        <CrInput label={p.name} value={p.value} />
        <CrCheckbox label={p.public} checked />
        <div className="flex flex-wrap items-center gap-3">
          <CrButton>{p.save}</CrButton>
          <CrButton variant="secondary">{p.look}</CrButton>
          <CrButton variant="outline">{p.cancel}</CrButton>
          <CrIconButton label={p.tips} variant="secondary" shape="round" badge={3}>
            <Sparkles aria-hidden="true" />
          </CrIconButton>
        </div>
      </div>
    </section>
  );
}
