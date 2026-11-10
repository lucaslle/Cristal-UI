import { AttachInternals, Component, Element, Event, EventEmitter, Prop, h } from '@stencil/core';
import { t } from '../../utils/i18n';

const STAR = 'M12 3.2l2.7 5.5 6 .9-4.4 4.3 1 6-5.3-2.8-5.4 2.8 1-6-4.3-4.3 6-.9z';
const WAVE_MS = 60;

const Star = ({ index }: { index: number }) => (
  <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" style={{ '--i': String(index) }}>
    <path d={STAR} stroke-linejoin="round" />
  </svg>
);

/**
 * Notation par étoiles : un groupe de boutons radio, une étoile par note possible, sous un titre visible.
 * Les étoiles se remplissent en vague jusqu'à la note choisie, qui rebondit ; le survol prévisualise la note.
 * En lecture seule, les étoiles forment une image nommée par la note (« Note : 4 sur 5 »).
 * @part label - Le titre.
 * @part star - Une étoile (un bouton radio, sauf en lecture seule).
 */
@Component({
  tag: 'cr-rating',
  styleUrls: ['../../global/field.css', 'cr-rating.css'],
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class CrRating {
  @Element() el!: HTMLCrRatingElement;
  @AttachInternals() internals: ElementInternals;

  /** Titre affiché au-dessus des étoiles, et nom du groupe pour les lecteurs d'écran (obligatoire). */
  @Prop() label!: string;
  /** Nom envoyé avec le formulaire. */
  @Prop({ reflect: true }) name?: string;
  /** Note choisie, de 0 (aucune) à max ; arrondie à l'entier. */
  @Prop({ mutable: true }) value = 0;
  /** Nombre d'étoiles, donc note maximale. */
  @Prop() max = 5;
  /** Désactive la notation. */
  @Prop({ reflect: true }) disabled = false;
  /** Affiche la note sans permettre de la changer. */
  @Prop({ reflect: true }) readonly = false;

  /** Émis quand l'utilisateur change la note ; detail : la nouvelle note. */
  @Event() crChange: EventEmitter<number>;

  private group?: HTMLElement;
  private initialValue?: number;
  private focusChecked = false;

  componentDidRender() {
    this.internals.setFormValue(this.current() ? String(this.current()) : null);
    if (this.focusChecked) this.group?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus();
    this.focusChecked = false;
  }

  formResetCallback() {
    if (this.initialValue !== undefined) this.value = this.initialValue;
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  // shortcut: pas de demi-étoile, une moyenne (4,3) s'affiche arrondie ; ajouter un remplissage partiel si on en a besoin.
  private current = () => Math.round(Math.min(this.max, Math.max(0, this.value)));

  private select(value: number) {
    if (this.disabled || this.readonly || value === this.current()) return;
    this.initialValue ??= this.value;
    this.value = value;
    this.crChange.emit(value);
    // L'étoile choisie rebondit quand la vague de remplissage l'atteint.
    const icon = this.group?.querySelectorAll('.icon')[value - 1];
    if (!icon || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    icon.animate({ transform: ['scale(1)', 'scale(1.35)', 'scale(1)'] }, { duration: 400, delay: (value - 1) * WAVE_MS, easing: 'cubic-bezier(.3,1.6,.5,1)' });
  }

  private onKeyDown = (event: KeyboardEvent) => {
    const value = this.current();
    const target = ({ ArrowRight: value + 1, ArrowUp: value + 1, ArrowLeft: value - 1, ArrowDown: value - 1, Home: 1, End: this.max } as Record<string, number>)[event.key];
    if (target === undefined || this.disabled) return;
    event.preventDefault();
    this.focusChecked = true;
    this.select(target < 1 ? this.max : target > this.max ? 1 : target);
  };

  render() {
    const m = t(this.el);
    const value = this.current();
    const stars = Array.from({ length: Math.max(1, this.max) }, (_, index) => index + 1);
    if (this.readonly) {
      return (
        <div class="field">
          <span class="label" part="label" aria-hidden="true">
            {this.label}
          </span>
          <div class="group" role="img" aria-label={m.ratingImage(this.label, value, this.max)}>
            {stars.map((star) => (
              <span class={{ star: true, on: star <= value }} part="star">
                <Star index={star - 1} />
              </span>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div class="field">
        <span class="label" id="label" part="label">
          {this.label}
        </span>
        <div class="group" role="radiogroup" aria-labelledby="label" aria-disabled={this.disabled ? 'true' : undefined} ref={(el) => (this.group = el)} onKeyDown={this.onKeyDown}>
          {stars.map((star) => (
            <button
              type="button"
              role="radio"
              class={{ star: true, on: star <= value }}
              part="star"
              aria-checked={star === value ? 'true' : 'false'}
              aria-label={m.ratingStar(star, this.max)}
              tabIndex={star === (value || 1) ? 0 : -1}
              disabled={this.disabled}
              onClick={() => this.select(star)}
            >
              <Star index={star - 1} />
            </button>
          ))}
        </div>
      </div>
    );
  }
}
