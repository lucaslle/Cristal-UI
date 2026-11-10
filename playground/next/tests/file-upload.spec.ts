import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

type Page = import('@playwright/test').Page;

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

const host = (page: Page) => page.locator('cr-file-upload[name="justificatifs"]');
const picker = (page: Page) => host(page).locator('input[type="file"]');
const file = (name: string, mimeType: string, size = 2048) => ({ name, mimeType, buffer: Buffer.alloc(size) });
const sent = (page: Page) =>
  page.getByTestId('upload-form').evaluate((form) => new FormData(form as HTMLFormElement).getAll('justificatifs').map((entry) => (entry as File).name));

const drag = (page: Page, type: 'dragover' | 'drop', files: [string, string][]) =>
  picker(page).evaluate(
    (input, [type, files]) => {
      const data = new DataTransfer();
      for (const [name, mime] of files) data.items.add(new File(['x'], name, { type: mime }));
      input.dispatchEvent(new DragEvent(type, { dataTransfer: data, bubbles: true, cancelable: true }));
    },
    [type, files] as const,
  );

test('a labelled native file picker, reachable with the keyboard', async ({ page }) => {
  await expect(page.getByLabel('Justificatifs')).toHaveAttribute('type', 'file');
  await expect(page.getByLabel('Justificatifs')).toHaveAccessibleDescription('PDF ou image, plusieurs fichiers possibles.');
  await page.getByLabel('Justificatifs').focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Justificatifs')).toBeFocused();
  const outline = await host(page).locator('.zone').evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(outline).toBe('solid');
  await expect(page.getByLabel('Photo de profil (verrouillée)')).toBeDisabled();
});

test('picked files are listed with their size, sent with the form and announced', async ({ page }) => {
  await picker(page).setInputFiles([file('facture.pdf', 'application/pdf'), file('ticket.png', 'image/png', 1_400_000)]);
  const rows = host(page).getByRole('listitem');
  await expect(rows).toHaveCount(2);
  await expect(rows.first()).toContainText('facture.pdf');
  await expect(rows.first()).toContainText('2 ko');
  await expect(rows.nth(1)).toContainText('1,4 Mo');
  await expect(page.getByTestId('upload-names')).toHaveText('facture.pdf, ticket.png');
  await expect(host(page).getByRole('status')).toHaveText('facture.pdf, ticket.png ajoutés. 2 fichiers.');
  expect(await sent(page)).toEqual(['facture.pdf', 'ticket.png']);
  expect(await rows.first().evaluate((el) => el.getAnimations().length)).toBeGreaterThan(0);
  expect((await new AxeBuilder({ page }).include('cr-file-upload').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()).violations).toEqual([]);
});

test('Remove takes a file out, announces it and moves focus to the next one', async ({ page }) => {
  await picker(page).setInputFiles([file('a.pdf', 'application/pdf'), file('b.pdf', 'application/pdf')]);
  await host(page).getByRole('button', { name: 'Retirer a.pdf' }).click();
  await expect(host(page).getByRole('listitem')).toHaveCount(1);
  await expect(host(page).getByRole('status')).toHaveText('a.pdf retiré. 1 fichier.');
  await expect(host(page).getByRole('button', { name: 'Retirer b.pdf' })).toBeFocused();
  expect(await sent(page)).toEqual(['b.pdf']);
  await page.keyboard.press('Enter');
  await expect(host(page).getByRole('listitem')).toHaveCount(0);
  await expect(page.getByLabel('Justificatifs')).toBeFocused();
  await expect(page.getByTestId('upload-names')).toHaveText('Aucun fichier');
});

test('the zone breathes while files are dragged over it and drops keep only accepted types', async ({ page }) => {
  const zone = host(page).locator('.zone');
  await drag(page, 'dragover', [['photo.jpg', 'image/jpeg']]);
  await expect(zone).toHaveAttribute('data-over', '');
  expect(await zone.evaluate((el) => el.getAnimations().filter((animation) => animation instanceof CSSAnimation).length)).toBe(1);
  await drag(page, 'drop', [['photo.jpg', 'image/jpeg'], ['virus.exe', 'application/x-msdownload']]);
  await expect(zone).not.toHaveAttribute('data-over', '');
  await expect(host(page).getByRole('listitem')).toHaveText([/photo\.jpg/]);
  await expect(host(page).getByText('virus.exe : format de fichier non accepté.', { exact: true }).first()).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await drag(page, 'dragover', [['photo.jpg', 'image/jpeg']]);
  await expect(zone).toHaveAttribute('data-over', '');
  expect(await zone.evaluate((el) => el.getAnimations().filter((animation) => animation instanceof CSSAnimation).length)).toBe(0);
});
