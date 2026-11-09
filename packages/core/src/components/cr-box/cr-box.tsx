import { Component, Host, Prop, h } from '@stencil/core';
import { background, columns, radius, spacing } from '../../utils/box';

export type BoxDisplay = 'block' | 'flex' | 'grid' | 'inline-flex' | 'inline-block' | 'none';

/**
 * Remplaçant de div pour la mise en page : espacements, flex et grille avec les valeurs du thème.
 * Les enfants restent des enfants directs : flex et grille s'appliquent à eux.
 * Valeurs d'espacement : xs, sm, lg, xl, 2xl, 3xl, ou toute valeur CSS (« 12px »).
 */
@Component({
  tag: 'cr-box',
})
export class CrBox {
  /** Type d'affichage. */
  @Prop() display: BoxDisplay = 'block';
  /** Sens des éléments en flex : row (en ligne) ou column (empilés). */
  @Prop() direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  /** Espace entre les enfants (flex et grille). */
  @Prop() gap?: string;
  /** Marge intérieure : une valeur, ou deux (« sm xl » : vertical puis horizontal). */
  @Prop() padding?: string;
  /** Alignement sur l'axe secondaire (align-items) : start, center, end, stretch, baseline. */
  @Prop() align?: string;
  /** Répartition sur l'axe principal (justify-content) : start, center, end, space-between… */
  @Prop() justify?: string;
  /** Passe à la ligne quand la place manque (flex). */
  @Prop() wrap = false;
  /** Grille : un nombre de colonnes égales (« 3 ») ou une largeur minimale de colonne (« 220px »). */
  @Prop() columns?: string;
  /** Fond : surface, subtle, muted, primary, ou toute couleur CSS. */
  @Prop() background?: string;
  /** Arrondi : m, l, full, ou toute valeur CSS. */
  @Prop() radius?: string;
  /** Ajoute une bordure fine. */
  @Prop() border = false;
  /** Ajoute une ombre douce. */
  @Prop() shadow = false;
  /** Largeur maximale (« 640px », « 60ch »…), centrée. */
  @Prop() maxWidth?: string;

  render() {
    const style = {
      display: this.display,
      flexDirection: this.direction,
      flexWrap: this.wrap ? 'wrap' : undefined,
      gap: spacing(this.gap),
      padding: spacing(this.padding),
      alignItems: this.align,
      justifyContent: this.justify,
      gridTemplateColumns: columns(this.columns),
      background: background(this.background),
      color: this.background === 'primary' ? 'var(--cr-color-on-primary)' : undefined,
      borderRadius: radius(this.radius),
      border: this.border ? '1px solid var(--cr-color-disabled)' : undefined,
      boxShadow: this.shadow ? 'var(--cr-shadow-m)' : undefined,
      maxWidth: this.maxWidth,
      marginInline: this.maxWidth ? 'auto' : undefined,
      boxSizing: 'border-box',
    };
    return (
      // Pas de slot : les enfants restent tels quels, sans nœud ajouté que React verrait à l'hydratation.
      <Host style={style} />
    );
  }
}
