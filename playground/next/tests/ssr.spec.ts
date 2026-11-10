import { expect, test } from '@playwright/test';

test('client components send their props as attributes in the server HTML', async ({ page }) => {
  const html = await (await page.request.get('/')).text();
  // Les 6 étapes de démonstration, plus celle de la section en anglais.
  const steppers = html.match(/<cr-stepper[^>]*>/g) ?? [];
  expect(steppers).toHaveLength(7);
  for (const variant of ['line', 'number', 'path', 'blocks', 'gauge', 'timeline']) {
    expect(steppers).toContainEqual(expect.stringContaining(`variant="${variant}"`));
  }
});
