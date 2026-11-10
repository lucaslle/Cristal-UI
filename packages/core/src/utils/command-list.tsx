import { h } from '@stencil/core';
import { ListOption } from './listbox';

interface CommandListProps {
  options: ListOption[];
  visible: number[];
  active: number;
  onHover: (index: number) => void;
  onPick: (index: number) => void;
}

/** Options visibles de cr-command-palette, rangées par data-group (dans l'ordre d'apparition) sous un titre de groupe. */
export const CommandList = ({ options, visible, active, onHover, onPick }: CommandListProps) => {
  const groups: { name?: string; indices: number[] }[] = [];
  visible.forEach((index) => {
    const name = options[index].group;
    const group = groups.find((item) => item.name === name);
    if (group) group.indices.push(index);
    else groups.push({ name, indices: [index] });
  });
  const option = (index: number) => (
    <div
      id={`option-${index}`}
      class="option"
      part="option"
      role="option"
      aria-selected={index === active ? 'true' : 'false'}
      aria-disabled={options[index].disabled ? 'true' : undefined}
      data-active={index === active ? '' : undefined}
      onMouseMove={() => !options[index].disabled && index !== active && onHover(index)}
      onClick={() => onPick(index)}
    >
      {options[index].label}
    </div>
  );
  return groups.map((group, position) =>
    group.name ? (
      <div class="group" role="group" aria-labelledby={`group-${position}`}>
        <div class="group-title" id={`group-${position}`} part="group">
          {group.name}
        </div>
        {group.indices.map(option)}
      </div>
    ) : (
      group.indices.map(option)
    ),
  );
};
