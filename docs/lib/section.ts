import type { Node, Root } from 'fumadocs-core/page-tree';

/** Rubrique du menu (séparateur « ---Formulaires--- ») sous laquelle se trouve la page, affichée au-dessus de son titre. */
export const sectionOf = (tree: Root, url: string) => {
  let current: string | undefined;
  const walk = (nodes: Node[]): string | undefined => {
    for (const node of nodes) {
      if (node.type === 'separator') current = typeof node.name === 'string' ? node.name : undefined;
      else if (node.type === 'page' && node.url === url) return current;
      else if (node.type === 'folder') {
        const found = walk(node.children);
        if (found) return found;
      }
    }
  };
  return walk(tree.children);
};

/**
 * Sépare la description d'une page de composant de sa dernière phrase, celle des balises (« Balise cr-button,
 * composant React CrButton. »), pour afficher ces noms en pastilles. Sans nom de balise, la description reste entière.
 */
export const splitTags = (description = '') => {
  const cut = description.lastIndexOf('. ', description.length - 2);
  const last = description.slice(cut + 2);
  const names = last.match(/\b(cr-[a-z-]+|Cr[A-Z][A-Za-z]+)\b/g);
  return names ? { lead: description.slice(0, cut + 1), names } : { lead: description, names: [] };
};
