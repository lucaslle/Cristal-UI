import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';

const message = 'Saisissez une adresse e-mail valide, par exemple nom@domaine.fr.';
// Élément animé attendu par variante : classe de l'élément et pseudo-élément éventuel.
const expected: Record<string, string> = {
  zigzag: 'cr-err-zigzag error-frame::before',
  pop: 'cr-err-pop error-frame::after',
  drop: 'cr-err-drop error',
  echo: 'cr-err-ring error-frame::before',
  jitter: 'cr-err-hop letter',
  wobble: 'cr-err-wobble error-frame',
};

const demo = (page: Page, id: string) => page.getByTestId(`error-${id}`);

// Animations d'erreur en cours dans le composant : « nom classe::pseudo ».
const animations = (host: Locator) =>
  host.evaluate((el) =>
    el
      .shadowRoot!.getAnimations()
      .map((a) => a as CSSAnimation)
      .filter((a) => a.animationName?.startsWith('cr-err-') && a.playState === 'running')
      .map((a) => {
        const effect = a.effect as KeyframeEffect;
        return `${a.animationName} ${(effect.target as Element).classList.contains('error-frame') ? 'error-frame' : (effect.target as Element).classList[0]}${effect.pseudoElement ?? ''}`;
      }),
  );

const submit = (page: Page, id: string) => demo(page, id).getByRole('button', { name: 'Continuer' }).click();

const errors: string[] = [];

test.beforeEach(async ({ page }) => {
  errors.length = 0;
  page.on('console', (entry) => entry.type() === 'error' && errors.push(entry.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await demo(page, 'zigzag').scrollIntoViewIfNeeded();
});

test.afterEach(() => expect(errors).toEqual([]));

for (const [variant, target] of Object.entries(expected)) {
  test(`error-animation ${variant}: an invalid submit shows the linked error and animates it, a second one replays it`, async ({ page }) => {
    const host = demo(page, variant).locator('cr-input');
    const field = demo(page, variant).getByRole('textbox', { name: `Courriel (${variant})` });
    await expect(host).toHaveAttribute('error-animation', variant);
    await field.fill('mia@');
    await submit(page, variant);
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    await expect(field).toHaveAttribute('aria-describedby', 'control-error');
    await expect(field).toHaveAccessibleDescription(message);
    await expect(demo(page, variant).getByText('Envoyé.')).toHaveCount(0);
    expect(await animations(host)).toContain(target);
    await expect.poll(() => animations(host), { timeout: 3000 }).toEqual([]);
    await submit(page, variant);
    expect(await animations(host)).toContain(target);
  });
}

test('error-animation none: the error shows without any animation', async ({ page }) => {
  const host = demo(page, 'none').locator('cr-input');
  const field = demo(page, 'none').getByRole('textbox', { name: 'Courriel (none)' });
  await submit(page, 'none');
  await expect(field).toHaveAttribute('aria-invalid', 'true');
  await expect(field).toHaveAccessibleDescription('Ce champ est obligatoire.');
  expect(await animations(host)).toEqual([]);
  await submit(page, 'none');
  expect(await animations(host)).toEqual([]);
});

test('error-animation: with reduced motion, nothing moves and the error still shows', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const variant of Object.keys(expected)) {
    const host = demo(page, variant).locator('cr-input');
    const field = demo(page, variant).getByRole('textbox');
    await field.fill('mia@');
    await submit(page, variant);
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    await expect(field).toHaveAccessibleDescription(message);
    await expect(host.locator('.error')).toBeVisible();
    expect(await host.evaluate((el) => el.shadowRoot!.getAnimations().length)).toBe(0);
  }
});

for (const variant of Object.keys(expected)) {
  test(`error-animation ${variant}: the message stays readable mid-animation`, async ({ page }) => {
    await demo(page, variant).getByRole('textbox').fill('mia@');
    await submit(page, variant);
    const audit = () => new AxeBuilder({ page }).include(`[data-testid="error-${variant}"]`).withRules(['color-contrast']).analyze();
    await page.waitForTimeout(100);
    expect((await audit()).violations).toEqual([]);
    await page.waitForTimeout(150);
    expect((await audit()).violations).toEqual([]);
  });
}

test('error-animation on a checkbox and an OTP: an invalid submit animates them', async ({ page }) => {
  const checkbox = demo(page, 'checkbox').locator('cr-checkbox');
  await submit(page, 'checkbox');
  await expect(demo(page, 'checkbox').getByRole('checkbox', { name: 'Je confirme mon inscription' })).toHaveAttribute('aria-invalid', 'true');
  expect(await animations(checkbox)).toContain('cr-err-pop error-frame::after');

  const otp = demo(page, 'otp').locator('cr-otp');
  await submit(page, 'otp');
  await expect(demo(page, 'otp').getByRole('textbox', { name: 'Code de vérification' })).toHaveAttribute('aria-invalid', 'true');
  expect(await animations(otp)).toContain('cr-err-ring error-frame::before');
  expect(await animations(otp)).toContain('cr-err-flash error-frame');
});
