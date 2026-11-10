import { CrSelect } from '@cristal/react';

export default function SelectAnimated() {
  return (
    <CrSelect label="Display as" value="list" animation="drum-roll">
      <option value="list">List</option>
      <option value="grid">Grid</option>
      <option value="board">Board</option>
    </CrSelect>
  );
}
