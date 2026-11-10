import { expect, test } from '@playwright/test';

type Page = import('@playwright/test').Page;

const short = (page: Page) => page.getByTestId('breadcrumb-short');
const long = (page: Page) => page.getByTestId('breadcrumb-long');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test("a navigation named Fil d'Ariane with an ordered list, the last item being the current page", async ({ page }) => {
  await expect(short(page)).toMatchAriaSnapshot(`
    - navigation "Fil d'Ariane":
      - list:
        - listitem:
          - link "Accueil"
        - listitem:
          - link "Documentation"
        - listitem: Bouton
  `);
  await expect(short(page).getByText('Bouton')).toHaveAttribute('aria-current', 'page');
  await expect(short(page).getByRole('link', { name: 'Documentation' })).not.toHaveAttribute('aria-current');
  expect(await short(page).evaluate((el) => el.shadowRoot!.querySelector('ol')!.tagName)).toBe('OL');
});

test('links stay native light-DOM links: Ctrl+click opens a new tab', async ({ page, context }) => {
  const link = short(page).getByRole('link', { name: 'Documentation' });
  expect(await link.evaluate((el) => el.parentElement!.tagName)).toBe('CR-BREADCRUMB');
  const [tab] = await Promise.all([context.waitForEvent('page'), link.click({ modifiers: ['ControlOrMeta'] })]);
  await tab.waitForLoadState();
  expect(tab.url()).toContain('/?docs');
  expect(page.url()).not.toContain('docs');
  await tab.close();
});

test('beyond max items the middle collapses behind a button that reveals them and moves focus', async ({ page }) => {
  await expect(long(page).getByRole('link')).toHaveCount(2);
  const more = long(page).getByRole('button', { name: 'Afficher les 3 niveaux masqués' });
  await expect(more).toHaveAttribute('aria-expanded', 'false');
  await expect(more).toHaveText('…');
  await more.focus();
  await page.keyboard.press('Enter');
  await expect(long(page).getByRole('link')).toHaveCount(5);
  await expect(long(page).getByRole('link', { name: 'Boutique' })).toBeFocused();
  await expect(long(page).getByRole('button')).toHaveCount(0);
  const animations = await long(page).evaluate((el) => Array.from(el.shadowRoot!.querySelectorAll('li'), (li) => getComputedStyle(li).animationName));
  expect(animations).toEqual(['none', 'cr-breadcrumb-in', 'cr-breadcrumb-in', 'cr-breadcrumb-in', 'none', 'none']);
});

test('with reduced motion the revealed items do not slide', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await long(page).getByRole('button', { name: 'Afficher les 3 niveaux masqués' }).click();
  const animations = await long(page).evaluate((el) => Array.from(el.shadowRoot!.querySelectorAll('li'), (li) => getComputedStyle(li).animationName));
  expect(animations.every((name) => name === 'none')).toBe(true);
});
