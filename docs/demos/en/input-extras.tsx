import { CrInput } from '@cristal/react';

const emails = ['mia@mail.com', 'mia.smith@company.com', 'lucas@example.com'];

export default function InputExtras() {
  return (
    <>
      <CrInput label="New password" type="password" autocomplete="new-password" strength />
      <CrInput label="Email" type="email" completions={emails} hint="Type “mia”, then press the right arrow to accept the suggestion" />
    </>
  );
}
