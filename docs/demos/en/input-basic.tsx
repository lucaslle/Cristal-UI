import { CrInput } from '@cristal/react';

export default function InputBasic() {
  return (
    <>
      <CrInput label="Email" type="email" name="email" hint="Format: name@domain.com" autocomplete="email" required />
      <CrInput label="Name" error="Name is required. Enter at least 2 characters." />
      <CrInput label="Reference" value="REF-001" disabled />
    </>
  );
}
