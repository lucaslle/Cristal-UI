import { h } from '@stencil/core';
import { ListOption } from './listbox';

interface OptionListProps {
  options: ListOption[];
  visible: number[];
  selection: string[];
  multiple: boolean;
  active: number;
  open: boolean;
  onHover: (index: number) => void;
  onPick: (index: number) => void;
}

const Check = ({ multiple, checked }: { multiple: boolean; checked: boolean }) =>
  multiple ? (
    <svg class={{ box: true, checked }} viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
      <rect x="2" y="2" width="16" height="16" rx="3" />
      {checked && <path d="M6 10l3 3 5-6" fill="none" stroke-width="2" stroke-linecap="round" />}
    </svg>
  ) : (
    checked && (
      <svg class="check" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path d="M5 12l5 5 9-10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    )
  );

export const OptionList = ({ options, visible, selection, multiple, active, open, onHover, onPick }: OptionListProps) =>
  visible.map((index, position) => {
    const option = options[index];
    const checked = selection.includes(option.value);
    return (
      <div
        id={`option-${index}`}
        class={{ option: true, item: true, multiple }}
        part="option"
        style={{ '--i': `${position}` }}
        role="option"
        aria-selected={checked ? 'true' : 'false'}
        aria-disabled={option.disabled ? 'true' : undefined}
        data-active={open && index === active ? '' : undefined}
        onMouseMove={() => !option.disabled && onHover(index)}
        onClick={() => onPick(index)}
      >
        {multiple && <Check multiple checked={checked} />}
        <span class="option-label">{option.label}</span>
        {!multiple && <Check multiple={false} checked={checked} />}
      </div>
    );
  });

interface SearchBoxProps {
  inputRef: (el: HTMLInputElement) => void;
  query: string;
  active: number;
  onQuery: (query: string) => void;
  onKeyDown: (event: KeyboardEvent) => void;
}

export const SearchBox = ({ inputRef, query, active, onQuery, onKeyDown }: SearchBoxProps) => (
  <div class="search">
    <input
      ref={inputRef}
      class="search-input"
      part="search"
      type="search"
      placeholder="Rechercher…"
      aria-label="Rechercher dans la liste"
      aria-controls="listbox"
      aria-autocomplete="list"
      aria-activedescendant={active >= 0 ? `option-${active}` : undefined}
      autocomplete="off"
      value={query}
      onInput={(event) => onQuery((event.target as HTMLInputElement).value)}
      onKeyDown={onKeyDown}
    />
  </div>
);

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

interface SelectPanelProps extends Omit<OptionListProps, 'visible'> {
  visible: number[];
  searchable: boolean;
  query: string;
  searchRef: (el: HTMLInputElement) => void;
  onQuery: (query: string) => void;
  onKeyDown: (event: KeyboardEvent) => void;
}

export const SelectPanel = (props: SelectPanelProps) => [
  props.searchable && (
    <SearchBox inputRef={props.searchRef} query={props.query} active={props.active} onQuery={props.onQuery} onKeyDown={props.onKeyDown} />
  ),
  <div class="list" id="listbox" role="listbox" aria-labelledby="label" aria-multiselectable={props.multiple ? 'true' : undefined}>
    <OptionList {...props} />
  </div>,
  props.searchable && (
    <p class="empty" role="status">
      {props.visible.length ? '' : 'Aucun résultat'}
    </p>
  ),
];
