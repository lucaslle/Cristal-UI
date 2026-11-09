import { expect, test, type Page } from '@playwright/test';

const stepper = (page: Page, name: string) => page.getByRole('group', { name });
const current = (page: Page, name: string) => stepper(page, name).locator('li[aria-current="step"]');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('line: Next and Back move one step, update the list and announce the step', async ({ page }) => {
  const group = stepper(page, 'Inscription Bead Line');
  await expect(current(page, 'Inscription Bead Line')).toHaveText('Compte : en cours');
  await expect(group.getByRole('button', { name: 'Précédent' })).toBeDisabled();
  await group.getByRole('button', { name: 'Suivant' }).click();
  await expect(current(page, 'Inscription Bead Line')).toHaveText('Profil : en cours');
  await expect(group.getByRole('listitem').first()).toHaveText('Compte : terminée');
  await expect(group.locator('[aria-live="polite"]')).toHaveText('Étape 2 sur 4 : Profil');
  await expect(page.getByText('Ajoutez votre nom et une photo.').first()).toBeVisible();
  await group.getByRole('button', { name: 'Précédent' }).click();
  await expect(current(page, 'Inscription Bead Line')).toHaveText('Compte : en cours');
  await expect(page.locator('cr-stepper[variant="line"]')).toHaveAttribute('data-direction', 'back');
});

test('line: the bead runs to the next dot', async ({ page }) => {
  const host = page.locator('cr-stepper[variant="line"]');
  await page.waitForFunction(() => document.querySelector('cr-stepper[variant="line"]')?.shadowRoot?.querySelector('.bead'));
  await host.evaluate((el) => {
    const bead = el.shadowRoot!.querySelector('.bead') as HTMLElement;
    const log: number[] = ((window as any).bead = []);
    const start = performance.now();
    const tick = () => (log.push(Math.round(bead.getBoundingClientRect().left)), performance.now() - start < 1500 && requestAnimationFrame(tick));
    tick();
  });
  await stepper(page, 'Inscription Bead Line').getByRole('button', { name: 'Suivant' }).click();
  await page.waitForTimeout(1600);
  const positions: number[] = await page.evaluate(() => (window as any).bead);
  const distinct = [...new Set(positions)];
  expect(distinct.length).toBeGreaterThan(3);
  expect(distinct).toEqual([...distinct].sort((a, b) => a - b));
});

test('finishing: the last button says Terminer, then crComplete and every step is done', async ({ page }) => {
  const group = stepper(page, 'Inscription Big Number');
  for (const label of ['Suivant', 'Suivant', 'Suivant']) await group.getByRole('button', { name: label }).click();
  await group.getByRole('button', { name: 'Terminer' }).click();
  await expect(group.locator('[aria-live="polite"]')).toHaveText('Toutes les étapes sont terminées.');
  await expect(group.getByRole('listitem')).toHaveText(['Compte : terminée', 'Profil : terminée', 'Offre : terminée', 'Fin : terminée']);
  await expect(group.getByRole('button', { name: 'Précédent' })).toBeFocused();
});

for (const [variant, title] of [
  ['number', 'Big Number'],
  ['path', 'Skill Path'],
  ['blocks', 'Level Blocks'],
  ['gauge', 'Gauge Arc'],
]) {
  test(`${variant}: moves forward and keeps its visual hidden from screen readers`, async ({ page }) => {
    const group = stepper(page, `Inscription ${title}`);
    await group.getByRole('button', { name: 'Suivant' }).click();
    await expect(current(page, `Inscription ${title}`)).toHaveText('Profil : en cours');
    const hidden = await page.locator(`cr-stepper[variant="${variant}"]`).evaluate((el) => el.shadowRoot!.querySelector('.stepper > :nth-child(2)')!.getAttribute('aria-hidden'));
    expect(hidden).toBe('true');
  });
}

test('gauge: the needle springs past the tick before settling', async ({ page }) => {
  const host = page.locator('cr-stepper[variant="gauge"]');
  await stepper(page, 'Inscription Gauge Arc').getByRole('button', { name: 'Suivant' }).click();
  const angles = await host.evaluate(
    (el) =>
      new Promise<number[]>((resolve) => {
        const needle = el.shadowRoot!.querySelector('.needle')!;
        const list: number[] = [];
        const tick = () => {
          const m = new DOMMatrix(getComputedStyle(needle).transform);
          list.push(Math.round((Math.atan2(m.b, m.a) * 180) / Math.PI));
          list.length < 60 ? requestAnimationFrame(tick) : resolve(list);
        };
        tick();
      }),
  );
  expect(Math.max(...angles)).toBeGreaterThan(60);
  expect(angles[angles.length - 1]).toBe(60);
});

test('blocks: the ball hops to the next block', async ({ page }) => {
  const host = page.locator('cr-stepper[variant="blocks"]');
  await stepper(page, 'Inscription Level Blocks').getByRole('button', { name: 'Suivant' }).click();
  expect(await host.evaluate((el) => el.shadowRoot!.querySelector('.ball')!.getAnimations().length)).toBe(1);
});

test('timeline: Continuer ticks the step, opens the next one, moves focus and completes', async ({ page }) => {
  const order = page.locator('cr-stepper[variant="timeline"]');
  await order.getByRole('button', { name: 'Continuer' }).click();
  await expect(page.getByRole('heading', { name: 'Panier (terminée)' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Adresse (en cours)' })).toBeVisible();
  await expect(order.locator('cr-step').nth(1)).toBeFocused();
  await order.getByRole('button', { name: 'Continuer' }).click();
  await order.getByRole('button', { name: 'Payer' }).click();
  await expect(page.getByRole('heading', { name: 'Paiement (terminée)' })).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: 'Commande validée' })).toBeVisible();
});

test('reduced motion: no animation anywhere in the stepper', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await stepper(page, 'Inscription Level Blocks').getByRole('button', { name: 'Suivant' }).click();
  const running = await page.locator('cr-stepper[variant="blocks"]').evaluate((el) => el.shadowRoot!.getAnimations().length);
  expect(running).toBe(0);
});
