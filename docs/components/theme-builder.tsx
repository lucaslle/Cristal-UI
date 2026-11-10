'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { CrButton, CrCheckbox, CrInput, CrMenu, CrSelect } from '@cristal/react';
import { useI18n } from 'fumadocs-ui/contexts/i18n';
import { contrastRatio, resolvedColor } from '@/lib/contrast';
import { builderCopy } from './theme-builder-copy';

const presets = ['#6d28d9', '#e11d48', '#0f766e', '#2563eb', '#f97316', '#000000'];
const radii = ['0px', '4px', '6px', '12px', '20px'];
const checks = [
  ['--cr-color-on-primary', '--cr-color-primary'],
  ['--cr-color-on-primary', '--cr-color-primary-hover'],
  ['--cr-color-primary-text', '--cr-color-primary-subtle'],
  ['--cr-color-primary-text', '--cr-color-surface'],
];

export function ThemeBuilder() {
  const c = builderCopy[useI18n().locale === 'fr' ? 'fr' : 'en'];
  const [color, setColor] = useState('#6d28d9');
  const [radius, setRadius] = useState('6px');
  const [results, setResults] = useState<[string, number][]>([]);
  const [copied, setCopied] = useState(false);
  const preview = useRef<HTMLDivElement>(null);
  const valid = /^#[0-9a-f]{6}$/i.test(color);
  const css = `:root {\n  --cr-color-primary: ${color};${radius === '6px' ? '' : `\n  --cr-radius-m: ${radius};`}\n}`;

  useEffect(() => {
    const element = preview.current;
    setCopied(false);
    if (!element || !valid) return;
    setResults(checks.map(([text, background], index) => [c.checks[index], contrastRatio(resolvedColor(element, text), resolvedColor(element, background))]));
  }, [color, radius, valid, c]);

  return (
    <div className="not-prose my-6 grid gap-6 rounded-xl border bg-[#f3f1f8] p-6 text-neutral-900 lg:grid-cols-2" style={{ colorScheme: 'light' }}>
      <div className="flex flex-col gap-4">
        <div className="flex items-end gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium">
            {c.colour}
            <input type="color" value={valid ? color : '#000000'} onChange={(event) => setColor(event.target.value)} className="h-10 w-14 cursor-pointer rounded border border-neutral-500" />
          </label>
          <CrInput label={c.hex} value={color} onCrInput={(event) => setColor(event.detail.trim())} error={valid ? undefined : c.hexError} />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label={c.ready}>
          {presets.map((value, index) => (
            <button key={value} type="button" aria-pressed={color === value} onClick={() => setColor(value)} className="flex items-center gap-2 rounded-full border border-neutral-500 bg-white px-3 py-1 text-sm aria-pressed:border-neutral-900 aria-pressed:font-semibold">
              <span aria-hidden="true" className="size-4 rounded-full" style={{ background: value }} />
              {c.presets[index]}
            </button>
          ))}
        </div>
        <CrSelect label={c.radius} value={radius} onCrChange={(event) => setRadius(event.detail as string)}>
          {radii.map((value, index) => (
            <option key={value} value={value}>{`${c.radii[index]} (${value})`}</option>
          ))}
        </CrSelect>
        <div>
          <h3 className="mb-2 text-sm font-semibold">{c.contrasts}</h3>
          <ul className="flex flex-col gap-1 text-sm">
            {results.map(([label, ratio]) => (
              <li key={label}>
                <strong className={ratio >= 4.5 ? 'text-green-800' : 'text-red-800'}>{ratio >= 4.5 ? c.pass : c.fail}</strong> — {label}
                {c.decimal === ',' ? ' : ' : ': '}
                {ratio.toFixed(2).replace('.', c.decimal)}:1
                {ratio < 4.5 && c.advice}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div ref={preview} className="cr-theme flex flex-col gap-4 rounded-lg border bg-white p-4" style={{ '--cr-color-primary': valid ? color : undefined, '--cr-radius-m': radius } as CSSProperties}>
          <div className="flex flex-wrap gap-2">
            <CrButton>{c.buttons[0]}</CrButton>
            <CrButton variant="secondary">{c.buttons[1]}</CrButton>
            <CrButton variant="outline">{c.buttons[2]}</CrButton>
            <CrButton variant="link">{c.buttons[3]}</CrButton>
          </div>
          <CrInput label={c.email} hint={c.emailHint} />
          <div className="flex flex-wrap items-end gap-4">
            <CrSelect label={c.country} placeholder={c.pickCountry} animation="anchor-pop">
              {c.countries.map(([value, name]) => (
                <option key={value} value={value}>
                  {name}
                </option>
              ))}
            </CrSelect>
            <CrMenu label="Actions" animation="anchor-pop">
              {c.actions.map(([value, name]) => (
                <option key={value} value={value}>
                  {name}
                </option>
              ))}
            </CrMenu>
          </div>
          <CrCheckbox label={c.newsletter} checked />
        </div>
        <div className="flex flex-col gap-2">
          <pre className="overflow-x-auto rounded-lg bg-neutral-900 p-4 text-sm text-neutral-50">
            <code>{css}</code>
          </pre>
          <div className="flex items-center gap-3">
            <CrButton
              variant="secondary"
              size="s"
              onClick={async () => {
                await navigator.clipboard.writeText(css);
                setCopied(true);
              }}
            >
              {c.copy}
            </CrButton>
            <span role="status" className="text-sm">{copied ? c.copied : ''}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
