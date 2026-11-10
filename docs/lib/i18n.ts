import { defineI18n } from 'fumadocs-core/i18n';

/** Anglais par défaut, français à côté : /en/… et /fr/… (export statique, pas de réécriture d'URL). */
export const i18n = defineI18n({
  defaultLanguage: 'en',
  languages: ['en', 'fr'],
  parser: 'dot',
});

export type Lang = (typeof i18n.languages)[number];

export const isLang = (value: string): value is Lang => (i18n.languages as string[]).includes(value);
