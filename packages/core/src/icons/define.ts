import * as paths from './paths';

type IconKey = keyof typeof paths;
type Kebab<S extends string> = S extends `${infer Head}${infer Tail}` ? `${Head extends Uppercase<Head> ? (Head extends Lowercase<Head> ? '' : '-') : ''}${Lowercase<Head>}${Kebab<Tail>}` : S;

/** Nom d'une icône en HTML : iconChevronDown devient chevron-down, l'élément cr-icon-chevron-down. */
export type IconName = Kebab<Uncapitalize<IconKey extends `icon${infer Name}` ? Name : never>>;

export const iconName = (key: string) => key.replace(/^icon/, '').replace(/[A-Z]/g, (letter, index: number) => `${index ? '-' : ''}${letter.toLowerCase()}`) as IconName;

const SVG = 'http://www.w3.org/2000/svg';
const lengthOf = (size: string | null) => (!size ? 'var(--cr-icon-size, 24px)' : /^\d+(\.\d+)?$/.test(size) ? `${size}px` : size);

/** Créée au premier appel : HTMLElement n'existe pas pendant le rendu serveur. */
let Base: (new () => HTMLElement & { paths: string[] }) | undefined;

const base = () =>
  (Base ??= class extends HTMLElement {
    static observedAttributes = ['size', 'color', 'label'];
    paths: string[] = [];

    connectedCallback() {
      this.render();
    }

    attributeChangedCallback() {
      if (this.shadowRoot) this.render();
    }

    private render() {
      const root = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
      const size = lengthOf(this.getAttribute('size'));
      const svg = document.createElementNS(SVG, 'svg');
      const attributes = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', focusable: 'false' };
      for (const [name, value] of Object.entries(attributes)) svg.setAttribute(name, value);
      svg.style.cssText = `display:block;width:${size};height:${size}`;
      svg.style.color = this.getAttribute('color') ?? '';
      for (const d of this.paths) svg.appendChild(document.createElementNS(SVG, 'path')).setAttribute('d', d);
      const style = document.createElement('style');
      style.textContent = ':host{display:inline-flex;flex:none;vertical-align:middle}';
      root.replaceChildren(style, svg);
      // Même marque que les composants Stencil : un élément Cristal rendu porte la classe hydrated.
      this.classList.add('hydrated');
      const label = this.getAttribute('label');
      if (label) {
        this.setAttribute('role', 'img');
        this.setAttribute('aria-label', label);
        this.removeAttribute('aria-hidden');
      } else {
        this.setAttribute('aria-hidden', 'true');
        this.removeAttribute('role');
        this.removeAttribute('aria-label');
      }
    }
  });

/**
 * Déclare les éléments cr-icon-* (toutes les icônes, ou seulement celles nommées).
 * Attributs : size (nombre en pixels ou longueur CSS, sinon --cr-icon-size ou 24 px), color (sinon la couleur du texte),
 * label (nom lu par les lecteurs d'écran ; sans lui, l'icône est décorative et masquée).
 */
export const defineIcons = (...names: IconName[]) => {
  for (const [key, d] of Object.entries(paths)) {
    const tag = `cr-icon-${iconName(key)}`;
    if ((names.length && !names.includes(iconName(key))) || customElements.get(tag)) continue;
    customElements.define(
      tag,
      class extends base() {
        paths = d;
      },
    );
  }
};
