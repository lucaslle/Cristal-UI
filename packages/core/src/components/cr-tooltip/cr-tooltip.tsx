import { Build, Component, Element, Host, Listen, Prop, State, h } from '@stencil/core';
import type { TooltipPlacement } from '../cr-icon-button/cr-icon-button';

/**
 * Infobulle : court texte d'aide affiché au survol et au focus clavier de l'élément qu'elle entoure.
 * Le texte décrit aussi cet élément pour les lecteurs d'écran. Échap la masque ; on peut la survoler sans qu'elle disparaisse.
 * @slot - Le déclencheur, un seul élément focalisable : bouton ou lien natif, ou cr-button.
 * @part tooltip - L'infobulle.
 */
@Component({
  tag: 'cr-tooltip',
  styleUrls: ['../../global/tooltip.css', 'cr-tooltip.css'],
  shadow: true,
})
export class CrTooltip {
  @Element() el!: HTMLCrTooltipElement;

  /** Texte de l'infobulle, court et sans lien ni bouton (obligatoire). */
  @Prop() text!: string;
  /** Côté où s'ouvre l'infobulle. */
  @Prop() placement: TooltipPlacement = 'top';

  /** Le déclencheur a le focus clavier. */
  @State() focused = false;
  /** Infobulle masquée avec Échap, jusqu'à ce que le pointeur ou le focus revienne sur le déclencheur. */
  @State() dismissed = false;

  private described?: Element;

  // Au survol, le focus est souvent ailleurs : Échap doit fermer l'infobulle depuis n'importe où (critère 1.4.13).
  @Listen('keydown', { target: 'document' })
  onDocumentKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') this.dismissed = true;
  }

  componentDidRender() {
    this.describe();
  }

  disconnectedCallback() {
    this.described?.removeAttribute('aria-description');
    this.described = undefined;
  }

  // shortcut: aria-description (ARIA 1.3) car un id ne traverse pas le shadow DOM ; passer à referenceTarget quand les navigateurs l'auront.
  private describe = () => {
    if (!Build.isBrowser) return;
    const trigger = this.el.firstElementChild;
    // Dans un cr-button, c'est le bouton natif de son shadow DOM qui reçoit le focus et porte la description.
    const target = trigger?.shadowRoot?.querySelector('button, a[href], input') ?? trigger ?? undefined;
    if (target !== this.described) this.described?.removeAttribute('aria-description');
    this.described = target;
    target?.setAttribute('aria-description', this.text);
  };

  private onFocusIn = (event: FocusEvent) => {
    this.dismissed = false;
    // Le focus posé par un clic de souris n'ouvre pas l'infobulle : le survol s'en charge.
    this.focused = (event.composedPath()[0] as Element).matches(':focus-visible');
  };

  render() {
    return (
      <Host onPointerEnter={() => (this.dismissed = false)} onFocusin={this.onFocusIn} onFocusout={() => (this.focused = false)}>
        <slot onSlotchange={this.describe} />
        <span
          class="tooltip"
          part="tooltip"
          role="tooltip"
          data-placement={this.placement}
          data-focused={this.focused ? '' : undefined}
          data-dismissed={this.dismissed ? '' : undefined}
        >
          {this.text}
        </span>
      </Host>
    );
  }
}
