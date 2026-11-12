import { h } from '@stencil/core';
import type { JSXBase } from '@stencil/core/internal';

interface StepButtonProps {
  dir: 1 | -1;
  label: string;
  controls: string;
  /** Borne atteinte : le bouton reste focalisable (aria-disabled) et ne fait plus rien. */
  atBound: boolean;
  hit: boolean;
  disabled: boolean;
  onStep: (dir: 1 | -1) => void;
}

export const StepButton = ({ dir, label, controls, atBound, hit, disabled, onStep }: StepButtonProps) => (
  <button
    type="button"
    class={{ btn: true, [dir > 0 ? 'plus' : 'minus']: true, hit }}
    part="button"
    aria-label={label}
    aria-controls={controls}
    aria-disabled={atBound && !disabled ? 'true' : undefined}
    disabled={disabled}
    onClick={() => !atBound && onStep(dir)}
  >
    <svg class="glyph" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d={dir > 0 ? 'M5 12h14M12 5v14' : 'M5 12h14'} fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
    </svg>
  </button>
);

/** Le nombre : le champ spinbutton, et l'ancien nombre (ghost) que certaines animations font partir. */
export const NumberView = ({ ghost, ...input }: { ghost?: string } & JSXBase.InputHTMLAttributes<HTMLInputElement>) => (
  <span class="number">
    {ghost !== undefined && (
      <span class="ghost" aria-hidden="true">
        {ghost}
      </span>
    )}
    <input class="spin" part="control" type="text" role="spinbutton" autocomplete="off" {...input} />
  </span>
);
