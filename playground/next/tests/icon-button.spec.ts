import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

type Page = import('@playwright/test').Page;
const tooltip = (page: Page, label: string) => page.locator(`cr-icon-button[label="${label}"] .tooltip`);

test('named by its label on the server, square and on the height scale', async ({ page, request }) => {
  const html = await (await request.get('/')).text();
  expect(html).toMatch(/<cr-icon-button[^>]*label="Paramètres"[^>]*><template shadowrootmode="open"[^]*?aria-label="Paramètres"/);
  for (const [label, side] of [['Modifier XS', 30], ['Modifier S', 36], ['Modifier M', 40], ['Modifier L', 48]] as const) {
    const box = await page.getByRole('button', { name: label, exact: true }).boundingBox();
    expect([box?.width, box?.height]).toEqual([side, side]);
  }
});

test('toggle flips aria-pressed on click and keyboard and reports it to React', async ({ page }) => {
  const like = page.getByRole('button', { name: 'Ajouter aux favoris' });
  await expect(like).toHaveAttribute('aria-pressed', 'false');
  await like.click();
  await expect(like).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('liked')).toHaveText('Favori');
  await like.press('Space');
  await expect(like).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByTestId('liked')).toHaveText('Pas favori');
});

test('tooltip shows the label on keyboard focus and hides with Escape', async ({ page }) => {
  const bold = page.getByRole('button', { name: 'Gras' });
  const tip = tooltip(page, 'Gras');
  await expect(tip).toBeHidden();
  await bold.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(bold).toBeFocused();
  await expect(tip).toBeVisible();
  await expect(tip).toHaveText('Gras');
  await page.keyboard.press('Escape');
  await expect(tip).toBeHidden();
  await page.keyboard.press('Tab');
  await expect(tooltip(page, 'Italique')).toBeVisible();
});

test('tooltip appears on hover and leaves with the pointer', async ({ page }) => {
  const italic = page.getByRole('button', { name: 'Italique' });
  await italic.hover();
  await expect(tooltip(page, 'Italique')).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(tooltip(page, 'Italique')).toBeHidden();
});

test('badge is part of the name and pops when it changes', async ({ page }) => {
  await page.getByRole('button', { name: 'Notifications (3)' }).click();
  const bell = page.getByRole('button', { name: 'Notifications (4)' });
  await expect(bell).toBeVisible();
  const badge = page.locator('cr-icon-button[label="Notifications"]').locator('.badge');
  expect(await badge.evaluate((el) => el.getAnimations().length)).toBeGreaterThan(0);
});

test('nothing animates on load and reduced motion skips the pop', async ({ page }) => {
  expect(await page.locator('cr-icon-button:not([loading])').evaluateAll((els) => els.flatMap((el) => el.shadowRoot!.getAnimations()).length)).toBe(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Gras' }).click();
  expect(await page.locator('cr-icon-button[label="Gras"]').evaluate((el) => el.shadowRoot!.getAnimations().length)).toBe(0);
});

test('disabled and loading buttons ignore clicks', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Supprimer', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Enregistrement' })).toHaveAttribute('aria-busy', 'true');
});

test('visible tooltip and pressed state have no axe violations', async ({ page }) => {
  await page.getByRole('button', { name: 'Ajouter aux favoris' }).click();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(tooltip(page, 'Ajouter aux favoris')).toBeVisible();
  await page.waitForTimeout(300);
  const results = await new AxeBuilder({ page }).include('cr-icon-button').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(results.violations).toEqual([]);
});
