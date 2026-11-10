import { AttachInternals, Component, Element, Event, EventEmitter, Prop, h } from '@stencil/core';

/** Croix quand le contrôle est désactivé (off), coche quand il est activé : mêmes commandes, pour que les traits glissent de l'un à l'autre. */
const marks = {
  off: ['M8 8L16 16', 'M16 8L8 16'],
  on: ['M6.5 12.5L10 16', 'M10 16L17.5 8'],
};

/**
 * Interrupteur : active ou désactive un réglage, avec effet immédiat.
 * La pastille s'étire en glissant, et sa croix se transforme en coche.
 * @part label - Le libellé.
 * @part control - La case native (rôle switch), invisible, posée sur le rail.
 * @part track - Le rail.
 */
@Component({
  tag: 'cr-switch',
  styleUrls: ['../../global/field.css', 'cr-switch.css'],
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class CrSwitch {
  @Element() el!: HTMLCrSwitchElement;
  @AttachInternals() internals: ElementInternals;

  /** Libellé affiché à côté de l'interrupteur. */
  @Prop() label!: string;
  /** Nom envoyé avec le formulaire. */
  @Prop({ reflect: true }) name?: string;
  /** Valeur envoyée quand l'interrupteur est activé. */
  @Prop() value = 'on';
  /** État activé. */
  @Prop({ mutable: true, reflect: true }) checked = false;
  /** Désactive l'interrupteur. */
  @Prop({ reflect: true }) disabled = false;

  /** Émis quand l'interrupteur change ; detail : l'état activé. */
  @Event() crChange: EventEmitter<boolean>;

  private initialChecked?: boolean;

  componentDidRender() {
    this.internals.setFormValue(this.checked ? this.value : null);
  }

  formResetCallback() {
    if (this.initialChecked !== undefined) this.checked = this.initialChecked;
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  private onChange = (event: Event) => {
    this.initialChecked ??= this.checked;
    this.checked = (event.target as HTMLInputElement).checked;
    this.crChange.emit(this.checked);
  };

  render() {
    const id = 'control';
    return (
      <div class="row">
        <span class="switch">
          <input id={id} class="input" part="control" type="checkbox" role="switch" checked={this.checked} disabled={this.disabled} onChange={this.onChange} />
          <span class="track" part="track" aria-hidden="true">
            <span class="knob">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                {marks[this.checked ? 'on' : 'off'].map((d) => (
                  <path d={d} />
                ))}
              </svg>
            </span>
          </span>
        </span>
        <label class="label" htmlFor={id} part="label">
          {this.label}
        </label>
      </div>
    );
  }
}
