'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { CrButton, CrCheckbox, CrInput, CrMenu, CrSelect } from '@cristal/react';
import { contrastRatio, resolvedColor } from '@/lib/contrast';

const presets = [
  ['Violet', '#6d28d9'],
  ['Rose', '#e11d48'],
  ['Sarcelle', '#0f766e'],
  ['Bleu', '#2563eb'],
  ['Orange', '#f97316'],
  ['Noir', '#000000'],
];

const radii = [
  ['0px', 'Carré'],
  ['4px', 'Léger'],
  ['6px', 'Doux'],
  ['12px', 'Arrondi'],
  ['20px', 'Très arrondi'],
];

const checks = [
  ['Texte du bouton principal', '--cr-color-on-primary', '--cr-color-primary'],
  ['Texte du bouton principal au survol', '--cr-color-on-primary', '--cr-color-primary-hover'],
  ['Texte du bouton secondaire', '--cr-color-primary-text', '--cr-color-primary-subtle'],
  ['Liens et contours sur fond blanc', '--cr-color-primary-text', '--cr-color-surface'],
];

export function ThemeBuilder() {
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
    setResults(checks.map(([label, text, background]) => [label, contrastRatio(resolvedColor(element, text), resolvedColor(element, background))]));
  }, [color, radius, valid]);

  return (
    <div className="not-prose my-6 grid gap-6 rounded-xl border bg-[#f3f1f8] p-6 text-neutral-900 lg:grid-cols-2" style={{ colorScheme: 'light' }}>
      <div className="flex flex-col gap-4">
        <div className="flex items-end gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Couleur
            <input type="color" value={valid ? color : '#000000'} onChange={(event) => setColor(event.target.value)} className="h-10 w-14 cursor-pointer rounded border border-neutral-500" />
          </label>
          <CrInput label="Code hexadécimal" value={color} onCrInput={(event) => setColor(event.detail.trim())} error={valid ? undefined : 'Saisissez un code à 6 chiffres, par exemple #6d28d9.'} />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Couleurs prêtes à l'emploi">
          {presets.map(([name, value]) => (
            <button key={value} type="button" aria-pressed={color === value} onClick={() => setColor(value)} className="flex items-center gap-2 rounded-full border border-neutral-500 bg-white px-3 py-1 text-sm aria-pressed:border-neutral-900 aria-pressed:font-semibold">
              <span aria-hidden="true" className="size-4 rounded-full" style={{ background: value }} />
              {name}
            </button>
          ))}
        </div>
        <CrSelect label="Arrondi des coins" value={radius} onCrChange={(event) => setRadius(event.detail as string)}>
          {radii.map(([value, name]) => (
            <option key={value} value={value}>{`${name} (${value})`}</option>
          ))}
        </CrSelect>
        <div>
          <h3 className="mb-2 text-sm font-semibold">Contrastes (minimum 4,5:1)</h3>
          <ul className="flex flex-col gap-1 text-sm">
            {results.map(([label, ratio]) => (
              <li key={label}>
                <strong className={ratio >= 4.5 ? 'text-green-800' : 'text-red-800'}>{ratio >= 4.5 ? 'Conforme' : 'Insuffisant'}</strong> — {label} :{' '}
                {ratio.toFixed(2).replace('.', ',')}:1
                {ratio < 4.5 && ' (choisissez une couleur plus foncée ou plus claire)'}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div ref={preview} className="cr-theme flex flex-col gap-4 rounded-lg border bg-white p-4" style={{ '--cr-color-primary': valid ? color : undefined, '--cr-radius-m': radius } as CSSProperties}>
          <div className="flex flex-wrap gap-2">
            <CrButton>Principal</CrButton>
            <CrButton variant="secondary">Secondaire</CrButton>
            <CrButton variant="outline">Contour</CrButton>
            <CrButton variant="link">Lien</CrButton>
          </div>
          <CrInput label="E-mail" hint="Format : nom@domaine.fr" />
          <div className="flex flex-wrap items-end gap-4">
            <CrSelect label="Pays" placeholder="Choisir un pays" animation="anchor-pop">
              <option value="fr">France</option>
              <option value="be">Belgique</option>
            </CrSelect>
            <CrMenu label="Actions" animation="anchor-pop">
              <option value="edit">Modifier</option>
              <option value="delete">Supprimer</option>
            </CrMenu>
          </div>
          <CrCheckbox label="Recevoir la newsletter" checked />
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
              Copier le CSS
            </CrButton>
            <span role="status" className="text-sm">{copied ? 'CSS copié dans le presse-papiers.' : ''}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
