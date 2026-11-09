import { h } from '@stencil/core';
import { ListOption } from './listbox';

interface OptionListProps {
  options: ListOption[];
  selected?: ListOption;
  active: number;
  open: boolean;
  onHover: (index: number) => void;
  onPick: (index: number) => void;
}

export const OptionList = ({ options, selected, active, open, onHover, onPick }: OptionListProps) =>
  options.map((option, index) => (
    <div
      id={`option-${index}`}
      class="option item"
      part="option"
      style={{ '--i': `${index}` }}
      role="option"
      aria-selected={option === selected ? 'true' : 'false'}
      aria-disabled={option.disabled ? 'true' : undefined}
      data-active={open && index === active ? '' : undefined}
      onMouseMove={() => !option.disabled && onHover(index)}
      onClick={() => onPick(index)}
    >
      <span>{option.label}</span>
      {option === selected && (
        <svg class="check" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path d="M5 12l5 5 9-10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      )}
    </div>
  ));

interface ComboTriggerProps {
  ref: (el: HTMLButtonElement) => void;
  open: boolean;
  active: number;
  required: boolean;
  disabled: boolean;
  error: string;
  describedBy?: string;
  text?: string;
  isPlaceholder: boolean;
  onKeyDown: (event: KeyboardEvent) => void;
  onClick: () => void;
}

export const ComboTrigger = (props: ComboTriggerProps) => (
  <button
    ref={props.ref}
    id="control"
    class="control trigger"
    part="control"
    type="button"
    role="combobox"
    aria-haspopup="listbox"
    aria-expanded={props.open ? 'true' : 'false'}
    aria-controls="listbox"
    aria-labelledby="label"
    aria-activedescendant={props.open && props.active >= 0 ? `option-${props.active}` : undefined}
    aria-required={props.required ? 'true' : undefined}
    aria-invalid={props.error ? 'true' : undefined}
    aria-describedby={props.describedBy}
    disabled={props.disabled}
    onKeyDown={props.onKeyDown}
    onClick={props.onClick}
    onKeyUp={(event: KeyboardEvent) => event.key === ' ' && event.preventDefault()}
  >
    <span class={{ value: true, placeholder: props.isPlaceholder }}>{props.text}</span>
    <svg class="chevron" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
  </button>
);
