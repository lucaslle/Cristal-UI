import { CrSelect } from '@cristal/react';

export default function SelectBasic() {
  return (
    <CrSelect label="Category" name="category" placeholder="Choose a category" hint="The category sets the tax rate.">
      <option value="book">Books</option>
      <option value="food">Groceries</option>
      <option value="tech">Electronics</option>
      <option value="old" disabled>
        Archived
      </option>
    </CrSelect>
  );
}
