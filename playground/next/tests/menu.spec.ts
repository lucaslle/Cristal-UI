import { expect, test } from '@playwright/test';

const animations = ['fade', 'anchor-pop', 'turn-over', 'card-deal', 'drum-roll', 'outline-trace', 'tile-build'];

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

for (const animation of animations) {
  test(`${animation}: opens on the first item, picks with the keyboard and closes cleanly`, async ({ page }) => {
    const trigger = page.getByRole('button', { name: animation, exact: true });
    await trigger.click();
    const menu = page.getByRole('menu', { name: animation });
    await expect(menu).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(menu.getByRole('menuitem', { name: 'Modifier' })).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(menu.getByRole('menuitem', { name: 'Dupliquer' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('menu-result')).toHaveText(`Action : duplicate (${animation})`);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toBeFocused();
    await expect(menu).toBeHidden();
    await expect
      .poll(() => page.locator('cr-menu').nth(animations.indexOf(animation)).evaluate((menu) => menu.shadowRoot!.querySelector('.popup')!.hasAttribute('data-state')))
      .toBe(false);
  });
}

test('ArrowUp opens on the last item and disabled items are skipped', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'fade', exact: true });
  await trigger.focus();
  await page.keyboard.press('ArrowUp');
  const menu = page.getByRole('menu', { name: 'fade' });
  await expect(menu.getByRole('menuitem', { name: 'Supprimer' })).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await expect(menu.getByRole('menuitem', { name: 'Dupliquer' })).toBeFocused();
});

test('Escape closes and gives focus back to the button', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'tile-build', exact: true });
  await trigger.click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('menu', { name: 'tile-build' })).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('jumps to an item by typing and closes on outside click', async ({ page }) => {
  await page.getByRole('button', { name: 'drum-roll', exact: true }).click();
  await page.keyboard.press('s');
  const menu = page.getByRole('menu', { name: 'drum-roll' });
  await expect(menu.getByRole('menuitem', { name: 'Supprimer' })).toBeFocused();
  await page.getByRole('heading', { name: 'Cristal' }).click();
  await expect(menu).toBeHidden();
});

test('falls back to a plain fade when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'turn-over', exact: true }).click();
  const name = await page
    .locator('cr-menu')
    .nth(2)
    .evaluate((menu) => getComputedStyle(menu.shadowRoot!.querySelector('.popup')!).animationName);
  expect(name).toBe('cr-fade-in');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('menu-result')).toHaveText('Action : edit (turn-over)');
});

test('inside a drawer, Escape closes the menu but not the drawer', async ({ page }) => {
  await page.getByRole('button', { name: 'Filtres' }).click();
  await page.getByRole('button', { name: "Plus d'options" }).click();
  await expect(page.getByRole('menu', { name: "Plus d'options" })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('menu', { name: "Plus d'options" })).toBeHidden();
  await expect(page.getByRole('dialog', { name: 'Filtres' })).toBeVisible();
});
