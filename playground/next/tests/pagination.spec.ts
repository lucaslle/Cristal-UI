import { expect, test } from '@playwright/test';

type Page = import('@playwright/test').Page;

const links = (page: Page) => page.getByTestId('pagination-links');
const buttons = (page: Page) => page.getByTestId('pagination-buttons');
const thumbX = (page: Page) => buttons(page).evaluate((el) => el.shadowRoot!.querySelector<HTMLElement>('.thumb')!.style.transform);

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('a navigation named Pagination, with an ellipsis for long ranges and the current page marked', async ({ page }) => {
  await expect(links(page)).toMatchAriaSnapshot(`
    - navigation "Pagination":
      - list:
        - listitem:
          - link "Page précédente"
        - listitem:
          - link "Page 1"
        - listitem:
          - link "Page 4"
        - listitem:
          - link "Page 5"
        - listitem:
          - link "Page 6"
        - listitem:
          - link "Page 20"
        - listitem:
          - link "Page suivante"
  `);
  await expect(links(page).getByRole('link', { name: 'Page 5', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(links(page).getByRole('link', { name: 'Page précédente' })).toHaveAttribute('href', '/?page=4');
  await expect(links(page).getByRole('link', { name: 'Page suivante' })).toHaveAttribute('href', '/?page=6');
  await expect(links(page).getByText('…')).toHaveCount(2);
});

test('with href every page is a real link: Ctrl+click opens a new tab', async ({ page, context }) => {
  const link = links(page).getByRole('link', { name: 'Page 6', exact: true });
  const [tab] = await Promise.all([context.waitForEvent('page'), link.click({ modifiers: ['ControlOrMeta'] })]);
  await tab.waitForLoadState();
  expect(tab.url()).toContain('/?page=6');
  expect(page.url()).not.toContain('page=');
  await tab.close();
});

test('without href, buttons emit crChange, the highlight slides, and focus survives a disabled arrow', async ({ page }) => {
  await expect(buttons(page).getByRole('button', { name: 'Page précédente' })).toBeDisabled();
  await expect(buttons(page).getByRole('button', { name: 'Page 1', exact: true })).toHaveAttribute('aria-current', 'page');
  const before = await thumbX(page);
  expect(await buttons(page).evaluate((el) => getComputedStyle(el.shadowRoot!.querySelector('.thumb')!).transitionProperty)).toContain('transform');
  await buttons(page).getByRole('button', { name: 'Page 2', exact: true }).click();
  await expect(page.getByTestId('pagination-page')).toHaveText('2');
  await expect(buttons(page).getByRole('button', { name: 'Page 2', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(buttons(page).getByRole('button', { name: 'Page 3', exact: true })).toBeVisible();
  await expect.poll(() => thumbX(page)).not.toBe(before);
  await buttons(page).getByRole('button', { name: 'Page précédente' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('pagination-page')).toHaveText('1');
  await expect(buttons(page).getByRole('button', { name: 'Page précédente' })).toBeDisabled();
  await expect(buttons(page).getByRole('button', { name: 'Page 1', exact: true })).toBeFocused();
});

test('with reduced motion the highlight jumps without sliding', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await buttons(page).evaluate((el) => getComputedStyle(el.shadowRoot!.querySelector('.thumb')!).transitionDuration)).toBe('0s');
});
