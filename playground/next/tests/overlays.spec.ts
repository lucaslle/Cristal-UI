import { expect, test } from './fixtures';

const focusIsInside = (tag: string) =>
  `(() => { let el = document.activeElement; while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement; return !!el && (el.closest('${tag}') !== null || el.getRootNode().host?.closest('${tag}') !== null); })()`;

// Le drawer glisse depuis son bord : on mesure une fois arrivé.
const settled = async (page: import('@playwright/test').Page, drawer: import('@playwright/test').Locator, gap = 0) => {
  const width = page.viewportSize()!.width - gap;
  await expect.poll(async () => {
    const box = await drawer.boundingBox();
    return box && Math.round(box.x + box.width);
  }).toBe(width);
};

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('dialog traps focus, closes with Escape and restores focus', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Supprimer le produit' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Supprimer le produit ?' });
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(focusIsInside('cr-dialog'))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('dialog footer action runs and closes the dialog', async ({ page }) => {
  await page.getByRole('button', { name: 'Supprimer le produit' }).click();
  const dialog = page.getByRole('dialog', { name: 'Supprimer le produit ?' });
  await page.locator('cr-dialog').getByRole('button', { name: 'Supprimer', exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByTestId('overlay-result')).toHaveText('Produit supprimé');
});

test('dialog close button is labelled and closes the dialog', async ({ page }) => {
  await page.getByRole('button', { name: 'Supprimer le produit' }).click();
  const dialog = page.getByRole('dialog', { name: 'Supprimer le produit ?' });
  await dialog.getByRole('button', { name: 'Fermer' }).click();
  await expect(dialog).toBeHidden();
});

test('drawer slides from the end edge and locks page scroll while open', async ({ page }) => {
  await page.getByRole('button', { name: 'Filtres' }).click();
  const drawer = page.getByRole('dialog', { name: 'Filtres' });
  await expect(drawer).toBeVisible();
  await settled(page, drawer);
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('hidden');
  await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden();
  await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe('');
});

test('clicking next to it closes by default, not with closeOnBackdrop false, nor after a selection that ends outside', async ({ page }) => {
  await page.getByRole('button', { name: 'Supprimer le produit' }).click();
  const dialog = page.getByRole('dialog', { name: 'Supprimer le produit ?' });
  await expect(dialog).toBeVisible();
  await page.mouse.click(5, 5);
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');

  const trigger = page.getByRole('button', { name: 'Filtres' });
  await trigger.click();
  const drawer = page.getByRole('dialog', { name: 'Filtres' });
  await expect(drawer).toBeVisible();
  await settled(page, drawer);
  const box = (await drawer.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + 20);
  await page.mouse.down();
  await page.mouse.move(10, box.y + 20);
  await page.mouse.up();
  await expect(drawer).toBeVisible();
  await page.mouse.click(10, box.y + 20);
  await expect(drawer).toBeHidden();
  await expect(trigger).toBeFocused();
});

const slide = async (page: import('@playwright/test').Page, action: () => Promise<void>) => {
  await page.evaluate(() => {
    const log: number[] = ((window as any).drawerX = []);
    const start = performance.now();
    const tick = () => {
      const panel = document.querySelector('cr-drawer')?.shadowRoot?.querySelector('dialog');
      const box = panel?.getBoundingClientRect();
      if (box?.width) log.push(Math.round(box.left));
      if (performance.now() - start < 700) requestAnimationFrame(tick);
    };
    tick();
  });
  await action();
  await page.waitForTimeout(800);
  return (await page.evaluate(() => (window as any).drawerX)) as number[];
};

test('the drawer slides in from its edge and back out when it closes', async ({ page }) => {
  const width = page.viewportSize()!.width;
  const opening = await slide(page, () => page.getByRole('button', { name: 'Filtres' }).click());
  const shown = opening.filter((x) => x < width);
  expect(shown.length).toBeGreaterThan(3);
  expect(shown[0]).toBeGreaterThan(shown[shown.length - 1]);
  expect(shown).toEqual([...shown].sort((a, b) => b - a));
  const closing = await slide(page, () => page.keyboard.press('Escape'));
  const leaving = closing.filter((x) => x < width);
  expect(leaving.length).toBeGreaterThan(3);
  expect(leaving).toEqual([...leaving].sort((a, b) => a - b));
  await expect(page.getByRole('dialog', { name: 'Filtres' })).toBeHidden();
});

test('reduced motion: the drawer appears without sliding', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const opening = await slide(page, () => page.getByRole('button', { name: 'Filtres' }).click());
  const shown = [...new Set(opening.filter((x) => x < page.viewportSize()!.width))];
  expect(shown).toHaveLength(1);
});

test('floating drawer: away from the edges, moved by dragging its header or with arrows on its handle', async ({ page }) => {
  const { width, height } = page.viewportSize()!;
  await page.getByRole('button', { name: 'Note rapide' }).click();
  const note = page.getByRole('dialog', { name: 'Note' });
  await expect(note).toBeVisible();
  await settled(page, note, 16);
  const start = (await note.boundingBox())!;
  expect(start.y).toBeGreaterThan(8);
  expect(width - (start.x + start.width)).toBeGreaterThan(8);
  expect(height - (start.y + start.height)).toBeGreaterThan(8);

  await page.mouse.move(start.x + start.width / 2, start.y + 24);
  await page.mouse.down();
  await page.mouse.move(start.x + start.width / 2 - 300, start.y + 24, { steps: 6 });
  await page.mouse.up();
  await expect(note).toBeVisible();
  const dragged = (await note.boundingBox())!;
  expect(Math.round(start.x - dragged.x)).toBe(300);

  const handle = note.getByRole('button', { name: 'Déplacer le panneau' });
  await handle.focus();
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('Shift+ArrowLeft');
  expect(Math.round(dragged.x - (await note.boundingBox())!.x)).toBe(80);

  await page.mouse.move(dragged.x + 40, dragged.y + 24);
  await page.mouse.down();
  await page.mouse.move(-500, dragged.y + 24, { steps: 4 });
  await page.mouse.up();
  expect((await note.boundingBox())!.x).toBe(0);

  await page.keyboard.press('Escape');
  await expect(note).toBeHidden();
  await page.getByRole('button', { name: 'Note rapide' }).click();
  await settled(page, note, 16);
  expect(Math.round((await note.boundingBox())!.x)).toBe(Math.round(start.x));
});

test('floating drawer: resized from its bottom corner with the pointer or the arrows, reset when it closes', async ({ page }) => {
  await page.getByRole('button', { name: 'Note rapide' }).click();
  const note = page.getByRole('dialog', { name: 'Note' });
  await settled(page, note, 16);
  const start = (await note.boundingBox())!;
  const grip = note.getByRole('button', { name: 'Redimensionner le panneau' });
  const corner = (await grip.boundingBox())!;
  expect(corner.x).toBeLessThan(start.x + 40);

  await page.mouse.move(corner.x + 12, corner.y + 12);
  await page.mouse.down();
  await page.mouse.move(corner.x + 12 - 120, corner.y + 12 - 200, { steps: 6 });
  await page.mouse.up();
  const resized = (await note.boundingBox())!;
  expect(Math.round(resized.width - start.width)).toBe(120);
  expect(Math.round(start.height - resized.height)).toBe(200);
  expect(Math.round(resized.x + resized.width)).toBe(Math.round(start.x + start.width));

  await grip.focus();
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('Shift+ArrowUp');
  const keyed = (await note.boundingBox())!;
  expect(Math.round(keyed.width - resized.width)).toBe(16);
  expect(Math.round(resized.height - keyed.height)).toBe(64);

  await page.mouse.move(keyed.x + 12, keyed.y + keyed.height - 12);
  await page.mouse.down();
  await page.mouse.move(keyed.x + 900, keyed.y - 900, { steps: 4 });
  await page.mouse.up();
  const smallest = (await note.boundingBox())!;
  expect(Math.round(smallest.width)).toBe(280);
  expect(Math.round(smallest.height)).toBe(200);

  await page.keyboard.press('Escape');
  await expect(note).toBeHidden();
  await page.getByRole('button', { name: 'Note rapide' }).click();
  await settled(page, note, 16);
  const reopened = (await note.boundingBox())!;
  expect(Math.round(reopened.width)).toBe(Math.round(start.width));
  expect(Math.round(reopened.height)).toBe(Math.round(start.height));
});
