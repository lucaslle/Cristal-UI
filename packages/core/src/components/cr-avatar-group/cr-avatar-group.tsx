import { Component, Element, Host, Prop, State, h } from '@stencil/core';
import { t } from '../../utils/i18n';

/**
 * Groupe d'avatars qui se chevauchent, et s'écartent au survol ou quand le focus est dedans.
 * Au-delà de max, les avatars restants sont résumés par une pastille « +N », nommée « N autres personnes ».
 * @slot - Les cr-avatar.
 * @part more - La pastille « +N ».
 */
@Component({
  tag: 'cr-avatar-group',
  styleUrl: 'cr-avatar-group.css',
  shadow: true,
})
export class CrAvatarGroup {
  @Element() el!: HTMLCrAvatarGroupElement;

  /** Nombre maximal d'avatars affichés ; les autres sont résumés par « +N ». Tous par défaut. */
  @Prop() max?: number;

  @State() count = 0;

  componentWillLoad() {
    this.count = this.el.children.length;
  }

  render() {
    const shown = this.max ?? this.count;
    const more = Math.max(0, this.count - shown);
    return (
      <Host>
        {/* Masque les avatars en trop depuis le shadow DOM, sans toucher aux enfants. */}
        {more > 0 && <style>{`::slotted(:nth-child(n + ${shown + 1})) { display: none; }`}</style>}
        <slot onSlotchange={() => (this.count = this.el.children.length)} />
        {more > 0 && (
          <span class="more" part="more" role="img" aria-label={t(this.el).avatarMore(more)}>
            +{more}
          </span>
        )}
      </Host>
    );
  }
}
