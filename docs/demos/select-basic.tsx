import { CrSelect } from '@cristal-ui/react';

export default function SelectBasic() {
  return (
    <CrSelect label="Catégorie" name="category" placeholder="Choisir une catégorie" hint="La catégorie détermine la TVA.">
      <option value="book">Livre</option>
      <option value="food">Alimentation</option>
      <option value="tech">High-tech</option>
      <option value="old" disabled>
        Archivée
      </option>
    </CrSelect>
  );
}
