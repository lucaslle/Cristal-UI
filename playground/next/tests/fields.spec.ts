import { expect, test, type Page } from '@playwright/test';

const form = (page: Page) => page.locator('form', { has: page.getByLabel('Code reçu par SMS') });

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await form(page).scrollIntoViewIfNeeded();
});

test('otp: one labelled field, digits only, boxes fill then turn green in a wave', async ({ page }) => {
  const otp = form(page).getByRole('textbox', { name: 'Code reçu par SMS' });
  await expect(otp).toHaveAttribute('autocomplete', 'one-time-code');
  await otp.pressSequentially('48a2', { delay: 20 });
  await expect(otp).toHaveValue('482');
  const host = page.locator('cr-otp');
  await expect(host.locator('.box.filled')).toHaveCount(3);
  await otp.pressSequentially('913');
  await expect(form(page).getByText('Code complet : 482913')).toBeVisible();
  await expect(host.locator('.otp.complete')).toBeVisible();
  const delays = await host.locator('.box').evaluateAll((boxes) => boxes.map((box) => getComputedStyle(box).transitionDelay));
  expect(delays[0]).not.toBe(delays[5]);
  await page.keyboard.press('Backspace');
  await expect(otp).toHaveValue('48291');
});

test('otp: pasting the code fills every box', async ({ page }) => {
  const otp = form(page).getByRole('textbox', { name: 'Code reçu par SMS' });
  await otp.focus();
  await page.evaluate(() => navigator.clipboard?.writeText).catch(() => undefined);
  await otp.fill('123 456');
  await expect(otp).toHaveValue('123456');
  await expect(page.locator('cr-otp .box.filled')).toHaveCount(6);
});

test('card: digits group by four, the caret stays put, expiry and CVC slide in', async ({ page }) => {
  const number = form(page).getByRole('textbox', { name: 'Carte bancaire' });
  await number.pressSequentially('42424242', { delay: 10 });
  await expect(number).toHaveValue('4242 4242');
  await expect(form(page).getByRole('textbox', { name: 'Expiration' })).toHaveCount(0);
  await number.pressSequentially('42424242', { delay: 10 });
  await expect(number).toHaveValue('4242 4242 4242 4242');
  const expiry = form(page).getByRole('textbox', { name: 'Expiration' });
  await expect(expiry).toBeVisible();
  await expect(number).toHaveAttribute('autocomplete', 'cc-number');
  await expiry.pressSequentially('1299');
  await expect(expiry).toHaveValue('12/99');
  await form(page).getByRole('textbox', { name: 'CVC' }).fill('123');
  await number.press('Home');
  await number.press('ArrowRight');
  await number.press('ArrowRight');
  await number.press('Delete');
  await number.press('Delete');
  await number.press('Delete');
  await expect(number).toHaveValue('4224 2424 2424 2');
  expect(await number.evaluate((el: HTMLInputElement) => el.selectionStart)).toBe(2);
});

test('card: an invalid number is flagged on that field only', async ({ page }) => {
  const number = form(page).getByRole('textbox', { name: 'Carte bancaire' });
  await number.fill('4242424242424241');
  await form(page).getByRole('textbox', { name: 'Expiration' }).focus();
  await expect(number).toHaveAccessibleDescription(/n’est pas valide/);
  await expect(number).toHaveAttribute('aria-invalid', 'true');
  await expect(form(page).getByRole('textbox', { name: 'Expiration' })).not.toHaveAttribute('aria-invalid', 'true');
});

test('password strength: the meter fills and the level is announced', async ({ page }) => {
  const password = form(page).getByLabel('Nouveau mot de passe');
  await password.fill('abc');
  await expect(password).toHaveAccessibleDescription('Sécurité : Très faible');
  await password.fill('Sunset42');
  await expect(password).toHaveAccessibleDescription('Sécurité : Bon');
  await expect(page.locator('cr-input .segment.on')).toHaveCount(3);
  await password.fill('Sunset42!horizon');
  await expect(password).toHaveAccessibleDescription('Sécurité : Fort');
});

test('textarea: grows one line at a time up to maxRows, then scrolls', async ({ page }) => {
  const note = form(page).getByLabel('Note', { exact: true });
  const height = () => note.evaluate((el) => (el as HTMLElement).getBoundingClientRect().height);
  await page.waitForTimeout(400);
  const one = await height();
  await note.fill('Première ligne\nDeuxième ligne');
  await expect.poll(height).toBeGreaterThan(one + 20);
  await note.fill(Array.from({ length: 12 }, (_, i) => `Ligne ${i + 1}`).join('\n'));
  await page.waitForTimeout(500);
  expect(await height()).toBeLessThan(one + 5 * 24);
  expect(await note.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
});

test('tags: Enter or comma adds a chip, × and Backspace remove, duplicates are refused', async ({ page }) => {
  const entry = form(page).getByRole('textbox', { name: 'Sujets' });
  const tags = page.locator('cr-tag-input .tag');
  await expect(tags).toHaveText(['design', 'animation']);
  await entry.fill('ui');
  await entry.press('Enter');
  await entry.pressSequentially('motion,');
  await expect(tags).toHaveText(['design', 'animation', 'ui', 'motion']);
  await entry.pressSequentially('Design,');
  await expect(page.locator('cr-tag-input [role="status"]')).toHaveText('Design est déjà dans la liste.');
  await form(page).getByRole('button', { name: 'Retirer animation' }).click();
  await expect(tags).toHaveText(['design', 'ui', 'motion']);
  await expect(entry).toBeFocused();
  await entry.press('Backspace');
  await expect(tags).toHaveText(['design', 'ui']);
});

test('ghost completion: shown in grey, accepted with the right arrow', async ({ page }) => {
  const email = form(page).getByLabel('Adresse de contact');
  await email.pressSequentially('mia@mail.co');
  await expect(page.locator('cr-input .rest')).toHaveText('m');
  await expect(email).toHaveAttribute('aria-autocomplete', 'inline');
  await expect(email).toHaveAccessibleDescription(/Suggestion : mia@mail.com/);
  await email.press('ArrowRight');
  await expect(email).toHaveValue('mia@mail.com');
  await expect(form(page).getByText('Complété pour vous')).toBeVisible();
});

test('everything is sent with the form and reset puts it back', async ({ page }) => {
  await form(page).getByRole('textbox', { name: 'Code reçu par SMS' }).fill('482913');
  await form(page).getByRole('textbox', { name: 'Carte bancaire' }).fill('4242424242424242');
  await form(page).getByRole('textbox', { name: 'Expiration' }).fill('1299');
  await form(page).getByRole('textbox', { name: 'CVC' }).fill('123');
  await form(page).getByRole('button', { name: 'Soumettre' }).click();
  const sent = page.getByTestId('fields-sent');
  await expect(sent).toContainText('"code":"482913"');
  await expect(sent).toContainText('"card":"4242424242424242","card-expiry":"12/99","card-cvc":"123","card-holder":""');
  await expect(sent).toContainText('"topics":"design|animation"');
  await form(page).getByRole('button', { name: 'Remettre à zéro' }).click();
  await expect(form(page).getByRole('textbox', { name: 'Code reçu par SMS' })).toHaveValue('');
});

test('box lays its children out with theme spacing', async ({ page }) => {
  const box = form(page).locator('cr-box').first();
  await expect(box).toHaveCSS('display', 'grid');
  await expect(box).toHaveCSS('gap', '24px');
  await expect(box).toHaveCSS('padding', '24px');
  expect(await box.evaluate((el) => el.children.length)).toBe(7);
});

test('card preview: fills while typing, shows the network and flips for the CVC', async ({ page }) => {
  const card = page.locator('cr-card-input[name="card"]');
  const visual = card.locator('.visual');
  await expect(visual).toHaveAttribute('aria-hidden', 'true');
  const number = card.getByRole('textbox', { name: 'Carte bancaire' });
  await number.pressSequentially('4242', { delay: 20 });
  await expect(visual.locator('.brand.visa').first()).toHaveText('VISA');
  await expect(visual).toHaveAttribute('data-brand', 'visa');
  await expect(visual.locator('.digits')).toHaveText('4242 •••• •••• ••••');
  await number.pressSequentially('424242424242');
  await card.getByRole('textbox', { name: 'Titulaire' }).fill('Mia Dupont');
  await expect(visual.locator('.holder')).toHaveText('MIA DUPONT');
  await card.getByRole('textbox', { name: 'Expiration' }).fill('1299');
  await expect(visual.locator('.expiry')).toHaveText('12/99');
  await card.getByRole('textbox', { name: 'CVC' }).focus();
  await expect(visual).toHaveClass(/flipped/);
  await card.getByRole('textbox', { name: 'CVC' }).fill('123');
  await expect(visual.locator('.cvc')).toHaveText('123');
  await number.focus();
  await expect(visual).not.toHaveClass(/flipped/);
});

test('card variant: every field is typed on the card, which flips for the CVC', async ({ page }) => {
  const host = page.locator('cr-card-input[name="oncard"]');
  const number = host.getByRole('textbox', { name: 'Carte (saisie sur la carte)' });
  await number.pressSequentially('5555555555554444', { delay: 5 });
  await expect(number).toHaveValue('5555 5555 5555 4444');
  await expect(host.locator('.editor')).toHaveAttribute('data-brand', 'mastercard');
  await host.getByRole('textbox', { name: /VALABLE/ }).fill('0929');
  await host.getByRole('textbox', { name: 'Titulaire' }).fill('Mia Dupont');
  const cvc = host.getByRole('textbox', { name: /Cryptogramme/ });
  await cvc.focus();
  await expect(host.locator('.editor')).toHaveClass(/flipped/);
  await cvc.fill('123');
  await host.getByRole('textbox', { name: 'Titulaire' }).focus();
  await expect(host.locator('.editor')).not.toHaveClass(/flipped/);
  await form(page).getByRole('button', { name: 'Soumettre' }).click();
  await expect(page.getByTestId('fields-sent')).toContainText('"oncard":"5555555555554444","oncard-expiry":"09/29","oncard-cvc":"123","oncard-holder":"Mia Dupont"');
});
