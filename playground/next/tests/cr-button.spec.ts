import { expect, test } from '@playwright/test';

test('is server-rendered with declarative shadow DOM', async ({ request }) => {
  const html = await (await request.get('/')).text();
  expect(html).toContain('<template shadowrootmode="open"');
});

test('hydrates without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Compter' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('follows the height scale', async ({ page }) => {
  await page.goto('/');
  for (const [label, height] of [['XS', 30], ['S', 36], ['M', 40], ['L', 48]] as const) {
    const box = await page.getByRole('button', { name: label, exact: true }).boundingBox();
    expect(box?.height).toBe(height);
  }
});

test('fires onClick with mouse and keyboard', async ({ page }) => {
  await page.goto('/');
  const button = page.getByRole('button', { name: 'Compter' });
  await button.click();
  await button.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Space');
  await expect(page.getByTestId('clicks')).toHaveText('Clics : 3');
});

test('exposes disabled and loading states', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Désactivé' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Chargement' })).toHaveAttribute('aria-busy', 'true');
});

test('with href it is a real link: Ctrl+click opens a new tab, disabled loses its address', async ({ page, context }) => {
  await page.goto('/');
  const link = page.getByRole('link', { name: "Lien vers l'accueil" });
  await expect(link).toHaveAttribute('href', '/?lien');
  const [tab] = await Promise.all([context.waitForEvent('page'), link.click({ modifiers: ['ControlOrMeta'] })]);
  await tab.waitForLoadState();
  expect(tab.url()).toContain('/?lien');
  expect(page.url()).not.toContain('lien');
  await tab.close();
  const disabled = page.getByRole('link', { name: 'Lien désactivé' });
  await expect(disabled).toHaveAttribute('aria-disabled', 'true');
  await expect(disabled).not.toHaveAttribute('href');
  await link.click();
  await expect(page).toHaveURL(/\?lien/);
});
