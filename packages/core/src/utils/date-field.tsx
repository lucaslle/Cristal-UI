import { h } from '@stencil/core';

interface DateBoxProps {
  inputRef: (el: HTMLInputElement) => void;
  toggleRef: (el: HTMLButtonElement) => void;
  text: string;
  required: boolean;
  disabled: boolean;
  open: boolean;
  error: string;
  describedBy?: string;
  /** Nom du bouton : « Choisir une date », ou « Changer la date, » suivi de la date choisie. */
  toggleLabel: string;
  onInput: (event: Event) => void;
  onChange: () => void;
  onEnter: () => void;
  onToggle: () => void;
}

/** Champ de saisie de la date et bouton qui ouvre le calendrier. */
export const DateBox = (props: DateBoxProps) => (
  <div class="box">
    <input
      ref={props.inputRef}
      id="control"
      class="control"
      part="control"
      type="text"
      autocomplete="off"
      value={props.text}
      required={props.required}
      disabled={props.disabled}
      aria-invalid={props.error ? 'true' : undefined}
      aria-describedby={props.describedBy}
      onInput={props.onInput}
      onChange={props.onChange}
      onKeyDown={(event) => event.key === 'Enter' && props.onEnter()}
    />
    <button
      ref={props.toggleRef}
      type="button"
      class="toggle"
      part="button"
      aria-label={props.toggleLabel}
      aria-haspopup="dialog"
      aria-expanded={props.open ? 'true' : 'false'}
      aria-controls="calendar"
      disabled={props.disabled}
      onClick={props.onToggle}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M4 10h16M9 3v4M15 3v4" />
      </svg>
    </button>
  </div>
);
