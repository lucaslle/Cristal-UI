import { test as base } from '@playwright/test';

export { expect } from '@playwright/test';
export type { Locator, Page } from '@playwright/test';

/** Vrai quand React a hydraté la page et que chaque composant Cristal est défini et rendu. */
const ready = () =>
  document.documentElement.hasAttribute('data-hydrated') &&
  [...document.querySelectorAll('*')].every((el) => !el.localName.startsWith('cr-') || (customElements.get(el.localName) !== undefined && el.classList.contains('hydrated')));

/**
 * page.goto attend que la page soit prête. Un clic ou une touche envoyés pendant l'hydratation se perdent :
 * sur une machine chargée (CI), les composants ne sont définis qu'une à deux secondes après l'événement load.
 */
export const test = base.extend({
  page: async ({ page, javaScriptEnabled }, use) => {
    const goto = page.goto.bind(page);
    page.goto = async (url, options) => {
      const response = await goto(url, options);
      if (javaScriptEnabled !== false) await page.waitForFunction(ready);
      return response;
    };
    await use(page);
  },
});
