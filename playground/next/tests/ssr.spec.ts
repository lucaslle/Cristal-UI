import { expect, test } from '@playwright/test';

test('client components send their props as attributes in the server HTML', async ({ page }) => {
  const html = await (await page.request.get('/')).text();
  const steppers = html.match(/<cr-stepper[^>]*>/g) ?? [];
  expect(steppers).toHaveLength(6);
  for (const variant of ['line', 'number', 'path', 'blocks', 'gauge', 'timeline']) {
    expect(steppers).toContainEqual(expect.stringContaining(`variant="${variant}"`));
  }
});
