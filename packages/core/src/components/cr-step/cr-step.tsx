import { Component, Element, Host, Prop, Watch, forceUpdate, h } from '@stencil/core';
import { StepperVariant, stepState } from '../../utils/stepper';

/**
 * Étape d'un cr-stepper. Son contenu n'est affiché que pendant l'étape.
 * @slot - Le contenu de l'étape.
 * @part content - Le contenu affiché.
 */
@Component({
  tag: 'cr-step',
  styleUrl: 'cr-step.css',
  shadow: true,
})
export class CrStep {
  @Element() el!: HTMLCrStepElement;

  /** Nom de l'étape. */
  @Prop() label!: string;

  @Watch('label')
  componentDidLoad() {
    const parent = this.el.parentElement;
    if (parent?.tagName === 'CR-STEPPER') forceUpdate(parent);
  }

  private config() {
    const parent = this.el.parentElement;
    const stepper = parent?.tagName === 'CR-STEPPER' ? (parent as HTMLCrStepperElement) : undefined;
    const steps = stepper ? Array.from(stepper.children).filter((child) => child.tagName === 'CR-STEP') : [this.el];
    const index = steps.indexOf(this.el);
    return {
      direction: stepper?.dataset.direction,
      variant: (stepper?.variant ?? stepper?.getAttribute('variant') ?? 'line') as StepperVariant,
      index,
      last: index === steps.length - 1,
      state: stepState(index, stepper?.current ?? Number(stepper?.getAttribute('current') ?? 0)),
    };
  }

  render() {
    const { variant, direction, index, last, state } = this.config();
    const timeline = variant === 'timeline';
    return (
      <Host data-variant={variant} data-direction={direction} data-state={state} data-last={last ? '' : undefined} hidden={!timeline && state !== 'current'} tabIndex={-1}>
        {timeline && (
          <span class="marker" aria-hidden="true">
            {state === 'done' ? (
              <svg class="tick" viewBox="0 0 24 24" width="16" height="16">
                <path d="M5 12l5 5 9-10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
              </svg>
            ) : (
              index + 1
            )}
          </span>
        )}
        <div class="body">
          {timeline && (
            <div class="title" role="heading" aria-level={3}>
              {this.label}
              {state !== 'todo' && <span class="sr-only">{state === 'done' ? ' (terminée)' : ' (en cours)'}</span>}
            </div>
          )}
          {state === 'current' && (
            <div class="content" part="content">
              <slot />
            </div>
          )}
        </div>
      </Host>
    );
  }
}
