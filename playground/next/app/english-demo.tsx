import { CrInput, CrSelect, CrStep, CrStepper, CrTable } from '@cristal/react/ssr';

/** Même composants, parent en anglais : les textes intégrés passent en anglais. */
export function EnglishDemo() {
  return (
    <section lang="en" data-testid="english" style={{ display: 'grid', gap: 'var(--cr-spacing-lg)', maxWidth: 520 }}>
      <form data-testid="english-form">
        <CrInput label="Email" name="english-email" type="email" required />
        <button type="submit">Send</button>
      </form>
      <CrSelect label="Country" searchable>
        <option value="uk">United Kingdom</option>
        <option value="ie">Ireland</option>
      </CrSelect>
      <CrStepper label="Sign-up" variant="path" navigation>
        <CrStep label="Account">Account details.</CrStep>
        <CrStep label="Profile">Profile details.</CrStep>
      </CrStepper>
      <CrTable label="Orders" columns={[{ key: 'id', label: 'Order' }, { key: 'total', label: 'Total' }]} rows={[{ id: 'A-1', total: '12 £' }]} />
    </section>
  );
}
