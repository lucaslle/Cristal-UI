import type { Messages } from './i18n';
import { h } from '@stencil/core';
import { ListOption, matchRange } from './listbox';

interface OptionListProps {
  options: ListOption[];
  visible: number[];
  selection: string[];
  multiple: boolean;
  active: number;
  open: boolean;
  onHover: (index: number) => void;
  onPick: (index: number) => void;
  query?: string;
}

/** Libellé dont la partie qui correspond à la recherche est mise en valeur. */
export const Label = ({ label, query }: { label: string; query?: string }) => {
  const range = query ? matchRange(label, query) : undefined;
  if (!range) return <span class="option-label">{label}</span>;
  return (
    <span class="option-label">
      {label.slice(0, range[0])}
      <span class="match" part="match">
        {label.slice(range[0], range[1])}
      </span>
      {label.slice(range[1])}
    </span>
  );
};

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

export const OptionList = ({ options, visible, selection, multiple, active, open, onHover, onPick, query }: OptionListProps) =>
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
        <Label label={option.label} query={query} />
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
  m: Messages;
}

export const SearchBox = ({ inputRef, query, active, onQuery, onKeyDown, m }: SearchBoxProps) => (
  <div class="search">
    <input
      ref={inputRef}
      class="search-input"
      part="search"
      type="search"
      placeholder={m.searchPlaceholder}
      aria-label={m.searchLabel}
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
    class="control trigger error-frame"
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
  loading: boolean;
  query: string;
  searchRef: (el: HTMLInputElement) => void;
  onQuery: (query: string) => void;
  onKeyDown: (event: KeyboardEvent) => void;
  m: Messages;
}

export const SelectPanel = (props: SelectPanelProps) => [
  props.searchable && (
    <SearchBox inputRef={props.searchRef} query={props.query} active={props.active} onQuery={props.onQuery} onKeyDown={props.onKeyDown} m={props.m} />
  ),
  <div class="list" id="listbox" role="listbox" aria-labelledby="label" aria-multiselectable={props.multiple ? 'true' : undefined} aria-busy={props.loading ? 'true' : undefined}>
    <OptionList {...props} />
  </div>,
  props.searchable && (
    <p class="empty" role="status">
      {props.loading ? props.m.searching : props.visible.length ? '' : props.m.noResults}
    </p>
  ),
];
