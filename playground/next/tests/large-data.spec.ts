import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

type Page = import('@playwright/test').Page;
const journal = (page: Page) => page.locator('cr-table', { has: page.getByText('Journal', { exact: true }) });
const rendered = (page: Page) => journal(page).locator('tbody tr');
// Les lignes s'ajoutent quand la fin du tableau approche de l'écran : on l'amène d'abord à l'écran.
const scrollToEnd = async (page: Page) => {
  await journal(page).scrollIntoViewIfNeeded();
  await journal(page).locator('.scroll').evaluate((el) => (el.scrollTop = el.scrollHeight));
};

test('a large table renders 100 rows, announces the total and adds more while scrolling', async ({ page }) => {
  await expect(rendered(page)).toHaveCount(100);
  await expect(journal(page).getByRole('table')).toHaveAttribute('aria-rowcount', '1001');
  await expect(journal(page).getByText('100 lignes sur 1 000 : la suite s\'affiche en défilant.')).toBeVisible();
  await expect(rendered(page).last()).toHaveAttribute('aria-rowindex', '101');
  await scrollToEnd(page);
  await expect(rendered(page)).toHaveCount(200);
  await expect(journal(page).getByText('200 lignes sur 1 000', { exact: false })).toBeVisible();
});

test('new rows start again from the first 100, and a short list ends without the marker', async ({ page }) => {
  await page.getByRole('checkbox', { name: 'Alertes seulement' }).check();
  await expect(journal(page).getByText('100 lignes sur 143', { exact: false })).toBeVisible();
  await expect(journal(page).getByRole('table')).toHaveAttribute('aria-rowcount', '144');
  await scrollToEnd(page);
  await expect(rendered(page)).toHaveCount(143);
  await expect(journal(page).locator('.more')).toHaveCount(0);
});

test('a widget whose content overflows can be scrolled from the keyboard', async ({ page }) => {
  const tasks = page.locator('cr-widget[label="Tâches"]');
  await expect(tasks.locator('.body')).not.toHaveAttribute('tabindex');
  await tasks.evaluate((widget) => {
    const list = document.createElement('ol');
    list.innerHTML = Array.from({ length: 30 }, (_, i) => `<li>Tâche ajoutée ${i + 1}</li>`).join('');
    widget.append(list);
  });
  await expect(tasks.locator('.body')).toHaveAttribute('tabindex', '0');
  const bodies = await page.locator('cr-widget').evaluateAll((widgets) =>
    widgets.map((widget) => {
      const body = widget.shadowRoot!.querySelector<HTMLElement>('.body')!;
      return { overflows: body.scrollHeight > body.clientHeight + 1, tabIndex: body.getAttribute('tabindex'), name: body.getAttribute('aria-label') };
    }),
  );
  expect(bodies.some((body) => body.overflows)).toBe(true);
  for (const body of bodies) expect(body.tabIndex).toBe(body.overflows ? '0' : null);
  const region = page.getByRole('region', { name: bodies.find((body) => body.overflows)!.name! });
  await region.focus();
  await page.keyboard.press('PageDown');
  await expect.poll(() => region.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
});
