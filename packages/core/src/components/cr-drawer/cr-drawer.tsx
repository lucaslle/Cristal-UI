import { Component, Element, Event, EventEmitter, Prop, Watch, h } from '@stencil/core';
import { t } from '../../utils/i18n';
import { OverlayContent, backdropClick, releaseScroll, syncDialog } from '../../utils/overlay';

/**
 * Panneau latéral, basé sur l'élément dialog natif.
 * @slot - Contenu du panneau.
 * @slot footer - Boutons d'action.
 * @part dialog - L'élément dialog.
 * @part title - Le titre.
 * @part close - Le bouton Fermer.
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

  /** Un clic sur le fond assombri, à côté, ferme le panneau. */
  @Prop() closeOnBackdrop = false;

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

  private onClose = () => {
    releaseScroll();
    this.open = false;
    this.crClose.emit();
  };

  render() {
    return (
      <dialog ref={(el) => (this.dialog = el)} class={`drawer ${this.placement}`} part="dialog" aria-labelledby="title" onClose={this.onClose} {...this.backdrop}>
        <OverlayContent
          label={this.label}
          closeLabel={this.closeLabel ?? t(this.el).close}
          hasFooter={!!this.el.querySelector('[slot="footer"]')}
          onCloseClick={() => (this.open = false)}
        />
      </dialog>
    );
  }
}
