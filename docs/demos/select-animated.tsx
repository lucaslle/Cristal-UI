import { CrSelect } from '@cristal/react';

export default function SelectAnimated() {
  return (
    <CrSelect label="Afficher en" value="list" animation="drum-roll">
      <option value="list">Liste</option>
      <option value="grid">Grille</option>
      <option value="board">Tableau</option>
    </CrSelect>
  );
}
