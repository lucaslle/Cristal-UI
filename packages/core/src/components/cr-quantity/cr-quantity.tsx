import { AttachInternals, Component, Element, Event, EventEmitter, Listen, Prop, State, Watch, h } from '@stencil/core';
import { t } from '../../utils/i18n';
import { FieldHeader, describedBy, ErrorAnimation } from '../../utils/field';
import { handleInvalid } from '../../utils/validation';
import { QuantityAnimation, clamp, formatter, parse, precision, keyTarget, limits, quantityValidity, replayStep, stepBy } from '../../utils/quantity';
import { NumberView, StepButton } from '../../utils/quantity-views';

/**
 * Sélecteur de quantité (motif spinbutton de l'APG) : un nombre, qui peut aussi être tapé, entre un bouton − et un bouton +, dans une pastille.
 * @part label - Le libellé.
 * @part control - Le nombre (champ role="spinbutton").
 * @part button - Les boutons − et +.
 */
@Component({
  tag: 'cr-quantity',
  styleUrls: ['../../global/field.css', '../../global/field-error.css', '../../global/field-error-motion.css', 'cr-quantity.css', 'cr-quantity-motion.css', 'cr-quantity-keyframes.css'],
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class CrQuantity {
  @Element() el!: HTMLElement;
  @AttachInternals() internals: ElementInternals;

  /** Libellé affiché au-dessus du sélecteur ; il nomme aussi les boutons (« Augmenter Quantité »). */
  @Prop() label!: string;
  /** Nom envoyé avec le formulaire. */
  @Prop({ reflect: true }) name?: string;
  /** Quantité choisie ; undefined quand l'utilisateur a vidé le champ. Par défaut : 0 ramené entre min et max. */
  @Prop({ mutable: true }) value?: number;
  /** Valeur minimale ; les pas partent d'elle. */
  @Prop() min = 0;
  /** Valeur maximale ; aucune par défaut. */
  @Prop() max?: number;
  /** Écart entre deux valeurs permises ; ses décimales donnent celles du nombre affiché. */
  @Prop() step = 1;
  /** Texte d'aide, lu par les lecteurs d'écran. */
  @Prop() hint?: string;
  /** Message d'erreur ; remplace le message automatique de validation. */
  @Prop() error?: string;
  /** Rend la saisie obligatoire (le champ ne peut pas rester vide). */
  @Prop({ reflect: true }) required = false;
  /** Désactive le sélecteur. */
  @Prop({ reflect: true }) disabled = false;
  /** Animation de l'erreur quand elle apparaît et à chaque envoi refusé : none (par défaut), zigzag, pop, drop, echo, jitter ou wobble. */
  @Prop({ reflect: true }) errorAnimation: ErrorAnimation = 'none';
  /**
   * Animation d'un pas (bouton ou flèches) : press (le bouton s'écrase, le nombre surgit en grandissant, par défaut), slide (le nombre arrive du côté du bouton),
   * ripple (une onde part du bouton et dévoile le nombre), stretch (la pastille s'étire, le nombre tangue), spin (le signe tourne, le nombre bascule) ou halo (un anneau jaillit, le nombre descend).
   */
  @Prop({ reflect: true }) animation: QuantityAnimation = 'press';

  /** Émis à chaque nouvelle valeur : chaque pas, et pendant la frappe ; detail : la quantité (undefined si le champ est vide). */
  @Event() crInput: EventEmitter<number | undefined>;
  /** Émis quand une valeur est validée : chaque pas, ou la frappe validée par Entrée ou en quittant le champ ; detail : la quantité. */
  @Event() crChange: EventEmitter<number | undefined>;

  @State() touched = false;
  /** Texte en cours de frappe, validé par Entrée ou en quittant le champ. */
  @State() draft?: string;
  /** Sens du dernier pas (1 ou -1) ; 0 : rien à animer. */
  @State() dir = 0;
  @State() previous?: number;
  /** Valeur annoncée après un clic sur − ou + (les flèches dans le champ sont déjà lues par les lecteurs d'écran). */
  @State() announced = '';

  private input?: HTMLInputElement;
  private initial?: number;
  private committed?: number;
  private replay = false;

  componentWillLoad() {
    this.value ??= clamp(0, this.bounds());
    this.initial = this.committed = this.value;
  }

  // Changer d'animation après un pas ne doit pas la jouer.
  @Watch('animation')
  animationChanged() {
    this.dir = 0;
  }

  @Listen('invalid')
  onInvalid(event: Event) {
    this.touched = true;
    handleInvalid(event, this.el, this.input);
  }

  formResetCallback() {
    this.value = this.committed = this.initial;
    this.draft = undefined;
    this.dir = 0;
    this.touched = false;
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  componentDidRender() {
    const [flags, message] = this.validity();
    this.internals.setFormValue(this.value === undefined ? null : String(this.value));
    this.internals.setValidity(flags, message, this.input);
    if (this.input && this.draft === undefined) this.input.value = this.shown();
    if (this.replay) replayStep(this.el);
    this.replay = false;
  }

  private bounds = () => ({ min: this.min, max: this.max, step: this.step > 0 ? this.step : 1 });

  private format = (n: number) => formatter(t(this.el).locale, this.bounds())(n);

  private shown = () => (this.value === undefined ? '' : this.format(this.value));

  private validity = () => quantityValidity(this.value, this.required, this.bounds(), t(this.el), this.format);

  /** Nouvelle valeur : crInput si elle change ; crChange en plus si elle est validée (pas, Entrée, sortie du champ) et a changé depuis la dernière. */
  private set(next: number | undefined, commit: boolean) {
    if (next !== this.value) this.crInput.emit((this.value = next));
    if (commit && this.value !== this.committed) this.crChange.emit((this.committed = this.value));
  }

  /** Un pas (ou une borne) : animé dans le sens du changement, annoncé seulement s'il vient d'un bouton ; sans changement, valide la frappe en cours. */
  private go(next: number, announce: boolean) {
    const from = this.value;
    this.draft = undefined;
    if (next === from) return this.set(from, true);
    this.previous = from;
    this.dir = from === undefined || next > from ? 1 : -1;
    this.replay = true;
    this.announced = announce ? this.format(next) : '';
    this.set(next, true);
  }

  private commit() {
    if (this.draft === undefined) return false;
    const typed = parse(this.draft);
    this.draft = undefined;
    this.touched = true;
    this.dir = 0;
    this.set(typed === undefined ? undefined : Number.isNaN(typed) ? this.committed : clamp(typed, this.bounds()), true);
    return true;
  }

  private onInput = (event: Event) => {
    this.draft = (event.target as HTMLInputElement).value;
    this.dir = 0;
    const typed = parse(this.draft);
    if (!Number.isNaN(typed)) this.set(typed, false);
  };

  private onKeyDown = (event: KeyboardEvent) => {
    const next = keyTarget(event.key, this.value ?? clamp(0, this.bounds()), this.bounds());
    if (next !== undefined) this.go(next, false);
    else if (event.key === 'Enter') this.commit() || this.internals.form?.requestSubmit();
    else return;
    event.preventDefault();
  };

  render() {
    const id = 'control';
    const m = t(this.el);
    const bounds = this.bounds();
    const error = this.error || (this.touched ? this.validity()[1] : '');
    const { atMin, atMax, chars } = limits(this.value, bounds, this.format);
    const button = { controls: id, disabled: this.disabled, onStep: (dir: 1 | -1) => this.go(stepBy(this.value ?? clamp(0, bounds), dir, bounds), true) };
    return (
      <div class="field">
        <FieldHeader id={id} label={this.label} required={this.required} hint={this.hint} error={error} animation={this.errorAnimation} />
        <div class={{ frame: true, 'error-frame': true, invalid: !!error, disabled: this.disabled }}>
          <div class={{ pill: true, run: this.dir !== 0, up: this.dir > 0, down: this.dir < 0 }} style={{ '--chars': `${chars}` }}>
            <StepButton {...button} dir={-1} label={m.quantityDecrease(this.label)} atBound={atMin} hit={this.dir < 0} />
            <NumberView
              ghost={this.dir && this.previous !== undefined ? this.format(this.previous) : undefined}
              ref={(el) => (this.input = el)}
              id={id}
              inputMode={precision(bounds) ? 'decimal' : 'numeric'}
              value={this.draft ?? this.shown()}
              disabled={this.disabled}
              aria-valuenow={this.value}
              aria-valuetext={this.value === undefined ? undefined : this.shown()}
              aria-valuemin={bounds.min}
              aria-valuemax={bounds.max}
              aria-required={this.required ? 'true' : undefined}
              aria-invalid={error ? 'true' : undefined}
              aria-describedby={describedBy({ id, hint: this.hint, error })}
              onInput={this.onInput}
              onKeyDown={this.onKeyDown}
              onBlur={() => this.commit()}
            />
            <StepButton {...button} dir={1} label={m.quantityIncrease(this.label)} atBound={atMax} hit={this.dir > 0} />
            <span class="fx" aria-hidden="true" />
          </div>
        </div>
        <span class="sr-only" role="status">{this.announced}</span>
      </div>
    );
  }
}
