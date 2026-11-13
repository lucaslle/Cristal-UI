import { Build, Component, Element, Host, Prop, h } from '@stencil/core';
import { t } from '../../utils/i18n';
import { keyFaces } from '../../utils/kbd';

/**
 * Touche du clavier, ou raccourci de plusieurs touches (« Ctrl + K »), dans le texte courant ou un menu.
 * Avec keys, Mod devient ⌘ sur Mac et Ctrl ailleurs ; les symboles Mac sont lus en toutes lettres par les lecteurs d'écran.
 * @slot - Une touche, quand keys n'est pas donné.
 * @part key - Chaque touche.
 */
@Component({
  tag: 'cr-kbd',
  styleUrl: 'cr-kbd.css',
  shadow: true,
})
export class CrKbd {
  @Element() el!: HTMLCrKbdElement;

  /** Raccourci, touches séparées par + : « Mod+K », « Shift+Alt+P ». Mod, Ctrl, Alt et Shift s'adaptent au système. */
  @Prop() keys?: string;

  render() {
    if (!this.keys) {
      return (
        <Host>
          <kbd class="key" part="key">
            <slot />
          </kbd>
        </Host>
      );
    }
    const apple = Build.isBrowser && /Mac|iPhone|iPad/.test(navigator.platform);
    const faces = keyFaces(this.keys, apple, t(this.el));
    return (
      <Host>
        <kbd class="combo">
          {faces.map((face, index) => [
            index > 0 && <span class="plus">+</span>,
            <kbd class="key" part="key">
              {face.spoken ? [<span aria-hidden="true">{face.shown}</span>, <span class="sr-only">{face.spoken}</span>] : face.shown}
            </kbd>,
          ])}
        </kbd>
      </Host>
    );
  }
}
