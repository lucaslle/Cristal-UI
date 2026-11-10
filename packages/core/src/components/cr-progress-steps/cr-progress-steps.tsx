import { Component, Element, Prop, h } from '@stencil/core';
import { t } from '../../utils/i18n';

/**
 * Étapes d'un traitement qui s'enchaînent (« Recherche », « Lecture », « Rédaction… ») :
 * les étapes passées sont cochées, l'étape en cours a un indicateur qui tourne, les suivantes n'apparaissent pas encore.
 * Chaque nouvelle étape est annoncée aux lecteurs d'écran.
 */
@Component({
  tag: 'cr-progress-steps',
  styleUrl: 'cr-progress-steps.css',
  shadow: true,
})
export class CrProgressSteps {
  @Element() el!: HTMLCrProgressStepsElement;

  /** Noms des étapes, dans l'ordre. */
  @Prop() steps: string[] = [];
  /** Étape en cours (0 pour la première) ; vaut le nombre d'étapes quand tout est terminé. */
  @Prop() current = 0;
  /** Nom de la liste (« Progression » par défaut). */
  @Prop() label?: string;

  render() {
    const messages = t(this.el);
    return (
      <ol aria-label={this.label ?? messages.progress} aria-live="polite">
        {this.steps.slice(0, this.current + 1).map((step, index) => {
          const state = index < this.current ? 'done' : 'current';
          return (
            <li key={index} class={state} aria-current={state === 'current' ? 'step' : undefined}>
              <span class="icon" aria-hidden="true">
                {state === 'done' ? (
                  <svg class="tick" viewBox="0 0 24 24" width="16" height="16">
                    <path d="M5 12l5 5 9-10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
                  </svg>
                ) : (
                  <span class="spinner" />
                )}
              </span>
              {step}
              <span class="sr-only">{messages.stepSuffix[state]}</span>
            </li>
          );
        })}
      </ol>
    );
  }
}
