import { Component, Element, Event, EventEmitter, Prop, Watch, h } from '@stencil/core';
import { t } from '../../utils/i18n';
import { dragFromHeader, followPointer, keyDelta, moveBy, resetMove, resizeBy } from '../../utils/drawer-move';
import { OverlayContent, backdropClick, releaseScroll, syncDialog } from '../../utils/overlay';

/**
 * Panneau latéral, basé sur l'élément dialog natif. En variante floating, il se détache des bords de l'écran ;
 * avec movable, on le déplace en glissant son en-tête, ou au clavier avec les flèches sur sa poignée ;
 * avec resizable, on change sa taille par son coin du bas, à la souris ou avec les flèches.
 * @slot - Contenu du panneau.
 * @slot footer - Boutons d'action.
 * @part dialog - L'élément dialog.
 * @part title - Le titre.
 * @part close - Le bouton Fermer.
 * @part handle - La poignée de déplacement (avec movable).
 * @part resize - La poignée de redimensionnement (avec resizable).
 * @part body - La zone de contenu.
 * @part footer - La zone des actions.
 */
@Component({
  tag: 'cr-drawer',
  styleUrls: ['../../global/overlay.css', 'cr-drawer.css'],
  shadow: true,
})
export class CrDrawer {
  @Element() el!: HTMLElement;

  /** Ouvre ou ferme le panneau. */
  @Prop({ mutable: true, reflect: true }) open = false;
  /** Titre affiché, et nom du panneau pour les lecteurs d'écran. */
  @Prop() label!: string;
  /** Libellé du bouton de fermeture (« Close », ou « Fermer » en français, par défaut). */
  @Prop() closeLabel?: string;
  /** Bord d'apparition : end (droite) ou start (gauche). */
  @Prop({ reflect: true }) placement: 'start' | 'end' = 'end';
  /** Allure : docked (collé au bord, sur toute la hauteur) ou floating (détaché des bords, coins arrondis). */
  @Prop({ reflect: true }) variant: 'docked' | 'floating' = 'docked';
  /** Avec variant="floating" : le panneau se déplace en glissant son en-tête, ou avec les flèches sur sa poignée ; il revient à son bord à la fermeture. */
  @Prop({ reflect: true }) movable = false;
  /** Avec variant="floating" : la taille du panneau se change par son coin du bas (côté page), à la souris ou avec les flèches ; elle revient à l'origine à la fermeture. */
  @Prop({ reflect: true }) resizable = false;

  /** Un clic sur le fond assombri, à côté, ferme le panneau ; false pour l'empêcher (formulaire long, confirmation). */
  @Prop() closeOnBackdrop = true;

  /** Émis à chaque fermeture : Échap, bouton Fermer, clic à côté (avec closeOnBackdrop) ou open à false. */
  @Event() crClose: EventEmitter<void>;

  private dialog?: HTMLDialogElement;
  private backdrop = backdropClick(() => this.closeOnBackdrop && (this.open = false));

  @Watch('open')
  openChanged() {
    syncDialog(this.dialog, this.open);
  }

  componentDidLoad() {
    this.openChanged();
  }

  disconnectedCallback() {
    if (this.dialog?.open) releaseScroll();
  }

  // shortcut: le coin de redimensionnement suit placement sans tenir compte du sens rtl ; à inverser si une page rtl l'utilise.
  private get fromLeft() {
    return this.placement === 'end';
  }

  private onHandleKeyDown = (event: KeyboardEvent) => {
    const delta = keyDelta(event);
    if (!delta || !this.dialog) return;
    event.preventDefault();
    moveBy(this.dialog, ...delta);
  };

  private onResizeKeyDown = (event: KeyboardEvent) => {
    const delta = keyDelta(event);
    if (!delta || !this.dialog) return;
    event.preventDefault();
    resizeBy(this.dialog, ...delta, this.fromLeft);
  };

  private onResizePointerDown = (event: PointerEvent) => {
    event.stopPropagation();
    if (this.dialog) followPointer(this.dialog, event, (dx, dy) => resizeBy(this.dialog!, dx, dy, this.fromLeft));
  };

  private onClose = () => {
    releaseScroll();
    resetMove(this.dialog);
    this.open = false;
    this.crClose.emit();
  };

  render() {
    const m = t(this.el);
    const floating = this.variant === 'floating';
    const canMove = floating && this.movable;
    const handle = canMove && (
      <button class="handle" part="handle" type="button" aria-label={m.moveDrawer} aria-description={m.moveDrawerHint} onKeyDown={this.onHandleKeyDown}>
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <g fill="currentColor">
            <circle cx="9" cy="6" r="1.5" />
            <circle cx="15" cy="6" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="18" r="1.5" />
            <circle cx="15" cy="18" r="1.5" />
          </g>
        </svg>
      </button>
    );
    return (
      <dialog ref={(el) => (this.dialog = el)} class={`drawer ${this.placement}`} part="dialog" aria-labelledby="title" onClose={this.onClose} {...this.backdrop}>
        <OverlayContent
          label={this.label}
          handle={handle}
          onHeaderPointerDown={canMove ? (event) => this.dialog && dragFromHeader(this.dialog, event) : undefined}
          closeLabel={this.closeLabel ?? m.close}
          hasFooter={!!this.el.querySelector('[slot="footer"]')}
          onCloseClick={() => (this.open = false)}
        />
        {floating && this.resizable && (
          <button
            class={`resize ${this.fromLeft ? 'at-left' : 'at-right'}`}
            part="resize"
            type="button"
            aria-label={m.resizeDrawer}
            aria-description={m.resizeDrawerHint}
            onKeyDown={this.onResizeKeyDown}
            onPointerDown={this.onResizePointerDown}
          >
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
              <path d="M14 6L6 14M14 11l-3 3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </button>
        )}
      </dialog>
    );
  }
}
