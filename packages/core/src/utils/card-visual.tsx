import { h } from '@stencil/core';
import { cardLength, groupCard } from './card';

/** Réseau de la carte, d'après ses premiers chiffres. */
export const brandOf = (digits: string) => {
  if (/^4/.test(digits)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'American Express';
  return '';
};

/** Numéro affiché sur la carte : les chiffres tapés, puis des points pour le reste. */
const shown = (digits: string) => groupCard(digits.padEnd(cardLength(digits), '•'));

interface CardVisualProps {
  digits: string;
  expiry: string;
  cvc: string;
  flipped: boolean;
}

/** Carte bancaire dessinée : se remplit pendant la frappe et se retourne pour le cryptogramme. Décorative. */
export const CardVisual = ({ digits, expiry, cvc, flipped }: CardVisualProps) => {
  const brand = brandOf(digits);
  return (
    <div class={{ visual: true, flipped }} aria-hidden="true">
      <div class="face front">
        <div class="top">
          <svg class="chip" viewBox="0 0 40 30" width="40" height="30">
            <rect x="1" y="1" width="38" height="28" rx="5" />
            <path d="M1 10h12M1 20h12M27 10h12M27 20h12M13 1v28M27 1v28" />
          </svg>
          <span key={brand} class="brand">
            {brand}
          </span>
        </div>
        <div class="digits">
          {shown(digits)
            .split('')
            .map((char, i) => (
              <span key={`${i}-${char}`} class={{ char: true, empty: char === '•', gap: char === ' ' }}>
                {char}
              </span>
            ))}
        </div>
        <div class="bottom">
          <span class="caption">Expire</span>
          <span class="expiry">{expiry || 'MM/AA'}</span>
        </div>
      </div>
      <div class="face back">
        <div class="stripe" />
        <div class="signature">
          <span class="cvc">{cvc.replace(/./g, '•') || '•••'}</span>
        </div>
        <span class="caption">Cryptogramme</span>
      </div>
    </div>
  );
};
