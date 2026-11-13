import { Component, Element, Host, Prop, State, h } from '@stencil/core';
import { t } from '../../utils/i18n';

/**
 * Bloc de code avec bouton Copier : commande d'installation, extrait de configuration, exemple d'appel.
 * Le code garde ses espaces et défile en largeur au besoin (au clavier aussi) ; la copie est annoncée aux lecteurs d'écran.
 * shortcut: pas de coloration syntaxique ; à ajouter avec un surligneur si la doc en a besoin.
 * @part header - La barre du haut, avec le titre et le bouton.
 * @part copy - Le bouton Copier.
 * @part code - Le bloc pre.
 */
@Component({
  tag: 'cr-code-block',
  styleUrl: 'cr-code-block.css',
  shadow: true,
})
export class CrCodeBlock {
  @Element() el!: HTMLCrCodeBlockElement;

  /** Le code à afficher, tel quel (obligatoire). */
  @Prop() code!: string;
  /** Titre affiché au-dessus du code : nom de fichier, langage ou « Terminal ». Il complète aussi le nom du bouton (« Copier package.json »). */
  @Prop() label?: string;

  /** Résultat de la dernière copie, affiché sur le bouton puis effacé. */
  @State() copied?: 'done' | 'failed';

  private timer?: ReturnType<typeof setTimeout>;

  disconnectedCallback() {
    clearTimeout(this.timer);
  }

  private copy = async () => {
    clearTimeout(this.timer);
    try {
      await navigator.clipboard.writeText(this.code);
      this.copied = 'done';
    } catch {
      this.copied = 'failed';
    }
    this.timer = setTimeout(() => (this.copied = undefined), 2000);
  };

  render() {
    const m = t(this.el);
    return (
      <Host>
        <div class="header" part="header">
          {this.label && <span class="label">{this.label}</span>}
          <button class="copy" part="copy" type="button" data-copied={this.copied} aria-label={this.label ? m.copyCode(this.label) : undefined} onClick={this.copy}>
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              {this.copied === 'done' ? (
                <path d="M5 12l5 5 9-10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              ) : (
                <g fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round">
                  <rect x="8" y="8" width="12" height="12" rx="2" />
                  <path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" />
                </g>
              )}
            </svg>
            <span aria-hidden={this.label ? 'true' : undefined}>{this.copied === 'done' ? m.copied : m.copy}</span>
          </button>
        </div>
        <pre part="code" tabindex="0">
          <code>{this.code}</code>
        </pre>
        <span class="status" role="status">
          {this.copied === 'done' ? m.copied : this.copied === 'failed' ? m.copyFailed : ''}
        </span>
      </Host>
    );
  }
}
