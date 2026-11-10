import { Component, Element, Prop, State, Watch, h } from '@stencil/core';
import { t } from '../../utils/i18n';

export type AvatarStatus = 'online' | 'away' | 'busy' | 'offline';

/** Écarts de teinte autour de la couleur principale, pour colorer les initiales selon le nom. */
const HUE_SHIFTS = [0, 60, 120, 180, 240, 300];

/** Initiales du premier et du dernier mot : « Marie Dupont » donne MD, « Jean-Pierre Martin » JM. */
const initials = (name: string) => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = (word = '') => Array.from(word)[0] ?? '';
  return (first(words[0]) + (words.length > 1 ? first(words[words.length - 1]) : '')).toUpperCase();
};

// Même nom, même couleur, sur toutes les pages et à chaque rendu.
const hueShift = (name: string) => HUE_SHIFTS[Array.from(name).reduce((hash, char) => (hash * 31 + char.codePointAt(0)!) % 9973, 0) % HUE_SHIFTS.length];

/** Marques de la pastille de statut : la forme change avec le statut, pas seulement la couleur. */
const STATUS_MARKS: Record<AvatarStatus, string> = {
  online: 'M3.6 6.2l1.6 1.6 3.2-3.4',
  away: 'M6 3.4V6l1.8 1.1',
  busy: 'M3.5 6h5',
  offline: '',
};

/**
 * Avatar d'une personne : sa photo, ou à défaut ses initiales sur une couleur tirée de son nom.
 * Le nom (et le statut éventuel) est lu par les lecteurs d'écran ; la pastille de statut change de forme selon le statut.
 * @part avatar - Le disque de l'avatar.
 * @part image - La photo.
 * @part status - La pastille de statut.
 */
@Component({
  tag: 'cr-avatar',
  styleUrl: 'cr-avatar.css',
  shadow: true,
})
export class CrAvatar {
  @Element() el!: HTMLCrAvatarElement;

  /** Nom de la personne (obligatoire) : nom lu par les lecteurs d'écran, et initiales quand il n'y a pas de photo. */
  @Prop() name!: string;
  /** Adresse de la photo ; les initiales la remplacent si elle ne se charge pas. */
  @Prop() src?: string;
  /** Taille : s 30px, m 40px, l 48px. */
  @Prop({ reflect: true }) size: 's' | 'm' | 'l' = 'm';
  /** Disponibilité, ajoutée au nom lu (« Marie Dupont, en ligne ») et montrée par une pastille de forme différente pour chaque statut. */
  @Prop({ reflect: true }) status?: AvatarStatus;

  @State() failed = false;

  @Watch('src')
  srcChanged() {
    this.failed = false;
  }

  render() {
    const name = this.name ?? '';
    const label = this.status ? `${name}, ${t(this.el).avatarStatus[this.status]}` : name;
    return (
      <span class="avatar" part="avatar" role="img" aria-label={label} style={{ '--cr-avatar-shift': String(hueShift(name)) }}>
        {this.src && !this.failed ? <img class="image" part="image" src={this.src} alt="" onError={() => (this.failed = true)} /> : <span class="initials">{initials(name)}</span>}
        {this.status && (
          <svg class="status" part="status" data-status={this.status} viewBox="0 0 12 12" aria-hidden="true">
            <circle cx="6" cy="6" r={this.status === 'offline' ? 4.5 : 6} />
            {STATUS_MARKS[this.status] && <path d={STATUS_MARKS[this.status]} />}
          </svg>
        )}
      </span>
    );
  }
}
