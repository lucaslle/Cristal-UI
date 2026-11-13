import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

type Page = import('@playwright/test').Page;

const dialog = (page: Page) => page.getByRole('dialog', { name: 'Palette de commandes' });
const input = (page: Page) => dialog(page).getByRole('combobox', { name: 'Palette de commandes' });
const option = (page: Page, name: string) => dialog(page).getByRole('option', { name, exact: true });
const thumbY = (page: Page) => page.locator('cr-command-palette').evaluate((el) => el.shadowRoot!.querySelector<HTMLElement>('.thumb')!.style.transform);

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('Ctrl+K opens a modal dialog with a combobox over grouped commands, the first one active', async ({ page }) => {
  await expect(dialog(page)).toBeHidden();
  await page.locator('body').press('ControlOrMeta+k');
  await expect(dialog(page)).toBeVisible();
  await expect(input(page)).toBeFocused();
  await expect(input(page)).toHaveAttribute('aria-expanded', 'true');
  await expect(dialog(page).getByRole('group', { name: 'Navigation' }).getByRole('option')).toHaveCount(3);
  await expect(dialog(page).getByRole('group', { name: 'Actions' }).getByRole('option')).toHaveCount(4);
  await expect(option(page, 'Accueil')).toHaveAttribute('aria-selected', 'true');
  const id = await input(page).getAttribute('aria-activedescendant');
  expect(await option(page, 'Accueil').getAttribute('id')).toBe(id);
});

test('typing filters without accents, arrows move (skipping disabled ones), Enter picks and focus returns', async ({ page }) => {
  const opener = page.getByRole('button', { name: 'Ouvrir la palette (Ctrl+K)' });
  await opener.click();
  await input(page).fill('parametres');
  await expect(dialog(page).getByRole('option')).toHaveCount(1);
  await expect(option(page, 'Paramètres')).toHaveAttribute('aria-selected', 'true');
  await input(page).fill('er');
  await expect(option(page, 'Créer une facture')).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('ArrowDown');
  await expect(option(page, 'Exporter en CSV')).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('ArrowDown');
  await expect(option(page, 'Archiver (indisponible)')).toHaveAttribute('aria-disabled', 'true');
  await expect(option(page, 'Se déconnecter')).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('ArrowUp');
  await expect(option(page, 'Exporter en CSV')).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Enter');
  await expect(dialog(page)).toBeHidden();
  await expect(page.getByTestId('palette-chosen')).toHaveText('export');
  await expect(page.getByTestId('palette-closed')).toHaveText('1');
  await expect(opener).toBeFocused();
});

test('no match shows the shared "no results" state in a status region; Escape closes and gives focus back', async ({ page }) => {
  const opener = page.getByRole('button', { name: 'Ouvrir la palette (Ctrl+K)' });
  await opener.focus();
  await page.keyboard.press('ControlOrMeta+k');
  await input(page).fill('zzz');
  await expect(input(page)).toHaveAttribute('aria-expanded', 'false');
  await expect(dialog(page).getByRole('listbox')).toBeHidden();
  await expect(dialog(page).getByRole('status')).toContainText('Aucun résultat pour « zzz »');
  await page.keyboard.press('Escape');
  await expect(dialog(page)).toBeHidden();
  await expect(opener).toBeFocused();
  await opener.click();
  await expect(input(page)).toHaveValue('');
});

test('the dialog drops in with a spring and the highlight slides between rows', async ({ page }) => {
  await page.getByRole('button', { name: 'Ouvrir la palette (Ctrl+K)' }).click();
  const palette = page.locator('cr-command-palette');
  expect(await palette.evaluate((el) => getComputedStyle(el.shadowRoot!.querySelector('dialog')!).animationName)).toBe('cr-palette-drop');
  const first = await thumbY(page);
  await expect.poll(() => palette.evaluate((el) => getComputedStyle(el.shadowRoot!.querySelector('.thumb')!).transitionProperty)).toContain('transform');
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => thumbY(page)).not.toBe(first);
  await option(page, 'Créer une facture').click();
  await expect(page.getByTestId('palette-chosen')).toHaveText('invoice');
});

test('with reduced motion nothing drops or slides', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Ouvrir la palette (Ctrl+K)' }).click();
  const palette = page.locator('cr-command-palette');
  expect(await palette.evaluate((el) => getComputedStyle(el.shadowRoot!.querySelector('dialog')!).animationName)).toBe('none');
  await page.waitForTimeout(100);
  expect(await palette.evaluate((el) => getComputedStyle(el.shadowRoot!.querySelector('.thumb')!).transitionDuration)).toBe('0s');
});

test('the open palette has no WCAG 2.1 AA violations detectable by axe', async ({ page }) => {
  await page.getByRole('button', { name: 'Ouvrir la palette (Ctrl+K)' }).click();
  await expect(dialog(page)).toBeVisible();
  await page.waitForTimeout(600);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()).violations).toEqual([]);
  await input(page).fill('zzz');
  await page.waitForTimeout(300);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()).violations).toEqual([]);
});

test('the matching letters are bold and coloured, the option name stays whole', async ({ page }) => {
  await page.getByRole('button', { name: 'Ouvrir la palette (Ctrl+K)' }).click();
  await input(page).fill('parametres');
  const match = dialog(page).locator('.match');
  await expect(match).toHaveText(['Paramètres']);
  await expect(option(page, 'Paramètres')).toBeVisible();
  await input(page).fill('er');
  await expect(option(page, 'Créer une facture').locator('.match')).toHaveText('er');
  expect(await match.first().evaluate((el) => Number(getComputedStyle(el).fontWeight))).toBeGreaterThanOrEqual(700);
  await input(page).fill('');
  await expect(match).toHaveCount(0);
});
