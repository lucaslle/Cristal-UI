/**
 * Rejoue l'animation d'erreur, même si le message n'a pas changé : l'attribut coupe les animations le temps d'un calcul de style,
 * elles repartent de zéro quand il disparaît. Une erreur qui apparaît se lance seule, par le CSS.
 */
export const replayError = (host: HTMLElement) => {
  if (!host.matches('[error-animation]:not([error-animation="none"])')) return;
  host.setAttribute('data-error-replay', '');
  // Mesurer force le calcul du style sans animation avant de retirer l'attribut (un appel, que le minifieur garde).
  host.getBoundingClientRect();
  host.removeAttribute('data-error-replay');
};
