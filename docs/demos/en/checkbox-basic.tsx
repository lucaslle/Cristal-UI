import { CrCheckbox } from '@cristal/react';

export default function CheckboxBasic() {
  return (
    <>
      <CrCheckbox label="Subscribe to the newsletter" name="newsletter" hint="One email a month, unsubscribe in one click." />
      <CrCheckbox label="Select all" indeterminate />
      <CrCheckbox label="Unavailable option" disabled />
      <CrCheckbox label="I accept the terms" error="You must accept the terms to continue." />
    </>
  );
}
