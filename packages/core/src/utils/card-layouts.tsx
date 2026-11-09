import { h } from '@stencil/core';
import { Brand, Chip, Contactless, brandOf } from './card-visual';

type InputProps = Record<string, unknown>;

export interface CardInputs {
  number: InputProps;
  holder: InputProps;
  expiry: InputProps;
  cvc: InputProps;
}

const CardIcon = () => (
  <svg class="icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
    <rect x="2.5" y="5" width="19" height="14" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.6" />
    <path d="M2.5 9.5h19M6 15h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
  </svg>
);

/** Champs classiques : numéro, puis titulaire, expiration et CVC qui glissent quand le numéro est complet. */
export const CardFields = ({ inputs, complete, holder }: { inputs: CardInputs; complete: boolean; holder: boolean }) => (
  <div class="card">
    <div class="number">
      <CardIcon />
      <input class="control" placeholder="1234 5678 9012 3456" {...inputs.number} />
    </div>
    {complete && (
      <div class="extra">
        {holder && (
          <label class="mini holder-field">
            <span>Titulaire</span>
            <input class="control" placeholder="Nom sur la carte" {...inputs.holder} />
          </label>
        )}
        <label class="mini">
          <span>Expiration</span>
          <input class="control" placeholder="MM/AA" {...inputs.expiry} />
        </label>
        <label class="mini">
          <span>CVC</span>
          <input class="control" placeholder="123" {...inputs.cvc} />
        </label>
      </div>
    )}
  </div>
);

/** Tout se saisit sur la carte : numéro, date et titulaire au recto, cryptogramme au verso. */
export const CardEditor = ({ inputs, digits, holder, flipped }: { inputs: CardInputs; digits: string; holder: boolean; flipped: boolean }) => {
  const brand = brandOf(digits);
  return (
    <div class={{ visual: true, editor: true, flipped }} data-brand={brand || 'default'}>
      <div class="face front">
        <span key={`skin-${brand}`} class="skin" aria-hidden="true" />
        <div class="row" aria-hidden="true">
          <Chip />
          <Contactless />
        </div>
        <input class="on-card digits-input" placeholder="•••• •••• •••• ••••" {...inputs.number} />
        <div class="valid">
          <label class="caption" htmlFor="expiry">
            VALABLE
            <br />
            JUSQU'À
          </label>
          <input class="on-card expiry-input" placeholder="MM/AA" {...inputs.expiry} />
        </div>
        <div class="row end">
          {holder ? (
            <span class="holder-box">
              <label class="caption" htmlFor="holder">
                Titulaire
              </label>
              <input class="on-card holder-input" placeholder="NOM DU TITULAIRE" {...inputs.holder} />
            </span>
          ) : (
            <span />
          )}
          <span aria-hidden="true">
            <Brand brand={brand} />
          </span>
        </div>
      </div>
      <div class="face back">
        <span key={`skin-${brand}`} class="skin" aria-hidden="true" />
        <div class="stripe" aria-hidden="true" />
        <div class="signature">
          <span class="lines" aria-hidden="true" />
          <input class="cvc-input" placeholder="123" {...inputs.cvc} />
        </div>
        <label class="caption cvc-caption" htmlFor="cvc">
          Cryptogramme (3 ou 4 chiffres)
        </label>
        <div class="row end" aria-hidden="true">
          <span class="hologram" />
          <Brand brand={brand} />
        </div>
      </div>
    </div>
  );
};
