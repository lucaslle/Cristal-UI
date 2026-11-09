import { h } from '@stencil/core';
import { cardLength, groupCard } from './card';

export type CardBrand = 'visa' | 'mastercard' | 'amex' | '';

/** Réseau de la carte, d'après ses premiers chiffres. */
export const brandOf = (digits: string): CardBrand => {
  if (/^4/.test(digits)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'mastercard';
  if (/^3[47]/.test(digits)) return 'amex';
  return '';
};

const BRAND_NAMES: Record<CardBrand, string> = { visa: 'VISA', mastercard: 'mastercard', amex: 'AMERICAN\nEXPRESS', '': '' };

/** Numéro affiché sur la carte : les chiffres tapés, puis des points pour le reste. */
const shown = (digits: string) => groupCard(digits.padEnd(cardLength(digits), '•'));

export const Chip = () => (
  <span class="chip">
    <svg viewBox="0 0 46 36" width="46" height="36">
      <path d="M1 12h14M1 24h14M31 12h14M31 24h14M15 1v34M31 1v34M15 12q8 6 16 0M15 24q8-6 16 0" />
    </svg>
  </span>
);

export const Contactless = () => (
  <svg class="contactless" viewBox="0 0 24 24" width="22" height="22">
    <path d="M7 8.5a5 5 0 0 1 0 7M10.5 6a9 9 0 0 1 0 12M14 3.5a13 13 0 0 1 0 17" />
  </svg>
);

export const Brand = ({ brand }: { brand: CardBrand }) =>
  brand && (
    <span key={brand} class={`brand ${brand}`}>
      {BRAND_NAMES[brand]}
    </span>
  );

interface CardVisualProps {
  digits: string;
  expiry: string;
  cvc: string;
  holder?: string;
  flipped: boolean;
}

/** Carte bancaire dessinée : se remplit pendant la frappe et se retourne pour le cryptogramme. Décorative. */
export const CardVisual = ({ digits, expiry, cvc, holder, flipped }: CardVisualProps) => {
  const brand = brandOf(digits);
  return (
    <div class={{ visual: true, flipped }} data-brand={brand || 'default'} aria-hidden="true">
      <div class="face front">
        <span key={`skin-${brand}`} class="skin" />
        <div class="row">
          <Chip />
          <Contactless />
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
        <div class="valid">
          <span class="caption">
            VALABLE
            <br />
            JUSQU'À
          </span>
          <span class="expiry">{expiry || 'MM/AA'}</span>
        </div>
        <div class="row end">
          <span class={{ holder: true, empty: !holder }}>{holder?.trim().toUpperCase() || 'NOM DU TITULAIRE'}</span>
          <Brand brand={brand} />
        </div>
      </div>
      <div class="face back">
        <span key={`skin-${brand}`} class="skin" />
        <div class="stripe" />
        <div class="signature">
          <span class="lines" />
          <span class="cvc">{cvc || '•••'}</span>
        </div>
        <p class="fine">Cette carte est strictement personnelle. En cas de perte ou de vol, faites-la opposer sans attendre.</p>
        <div class="row end">
          <span class="hologram" />
          <Brand brand={brand} />
        </div>
      </div>
    </div>
  );
};
