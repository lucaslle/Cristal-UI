import { FunctionalComponent, h } from '@stencil/core';

interface ControlProps {
  href?: string;
  target?: string;
  disabled: boolean;
  loading: boolean;
  [attribute: string]: unknown;
}

/**
 * Élément natif de cr-button et cr-icon-button : un vrai lien quand href est donné, pour que Ctrl/Cmd+clic, clic molette
 * et « Ouvrir dans un nouvel onglet » restent ceux du navigateur ; un bouton sinon.
 */
export const Control: FunctionalComponent<ControlProps> = ({ href, target, disabled, loading, ...attributes }, children) => {
  if (href === undefined) {
    return (
      <button class="control" type="button" disabled={disabled} aria-disabled={loading ? 'true' : undefined} aria-busy={loading ? 'true' : undefined} {...attributes}>
        {children}
      </button>
    );
  }
  const inactive = disabled || loading;
  // Un lien désactivé perd son href : plus cliquable, plus focalisable, plus ouvrable dans un onglet.
  return (
    <a
      class="control"
      href={inactive ? undefined : href}
      target={target}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      role={inactive ? 'link' : undefined}
      aria-disabled={inactive ? 'true' : undefined}
      aria-busy={loading ? 'true' : undefined}
      data-disabled={disabled ? '' : undefined}
      {...attributes}
    >
      {children}
    </a>
  );
};
