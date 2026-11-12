'use client';
import SearchDialog from '@/components/search';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { useTheme } from 'fumadocs-ui/provider/base';
import { defineI18nUI } from 'fumadocs-ui/i18n';
import { type ReactNode, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { i18n } from '@/lib/i18n';

const translations = {
  'Back to Home(404 page)': "Retour à l'accueil",
  'Close Search(aria-label)': 'Fermer la recherche',
  'Close Sidebar(aria-label)': 'Fermer le menu',
  'Close Sidebar(sidebar)(aria-label)': 'Fermer le menu',
  'Collapse Sidebar(aria-label)': 'Réduire le menu',
  'Copied Anchor Link(heading anchor)(aria-label)': 'Lien copié',
  'Copy Anchor Link(heading anchor)(aria-label)': 'Copier le lien',
  'Copied Text(code block)(aria-label)': 'Code copié',
  'Copy Text(code block)(aria-label)': 'Copier le code',
  'Dark(theme switcher)(aria-label)': 'Thème sombre',
  'Hide Sidebar(sidebar)': 'Masquer le menu',
  'Light(theme switcher)(aria-label)': 'Thème clair',
  'Next Page(pagination)': 'Page suivante',
  'No Headings(table of contents)': 'Aucun titre',
  'On this page': 'Sur cette page',
  'On this page(table of contents)': 'Sur cette page',
  'Open Search(aria-label)': 'Ouvrir la recherche',
  'Open Search(search trigger)(aria-label)': 'Ouvrir la recherche',
  'Open Sidebar(aria-label)': 'Ouvrir le menu',
  'Open Sidebar(sidebar)(aria-label)': 'Ouvrir le menu',
  'Page Not Found(404 page)': 'Page introuvable',
  'Previous Page(pagination)': 'Page précédente',
  Search: 'Rechercher',
  'Search(search trigger)': 'Rechercher',
  'Show Sidebar(sidebar)': 'Afficher le menu',
  'Skip to Content(skip link)': 'Aller au contenu',
  'System(theme switcher)(aria-label)': 'Thème du système',
  'Table of Contents(inline table of contents)': 'Sommaire',
  'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.(404 page)':
    "La page que vous cherchez a peut-être été supprimée ou renommée, ou n'est pas disponible pour le moment.",
  'Toggle Menu(mobile menu)(aria-label)': 'Ouvrir ou fermer le menu',
  'Toggle Theme(theme switcher)(aria-label)': 'Changer de thème',
};

const i18nUI = defineI18nUI(i18n, {
  en: { displayName: 'English' },
  fr: { displayName: 'Français', ...translations },
});

/**
 * Une bascule cr-theme-toggle des exemples change aussi le thème retenu par la doc (next-themes), pour que le sélecteur de la doc
 * et la bascule restent d'accord ; dans l'autre sens, la bascule suit data-theme d'elle-même.
 * flushSync : la classe dark doit être posée avant la capture du nouvel état par la transition de vue.
 */
function ThemeToggleSync() {
  const { setTheme } = useTheme();
  useEffect(() => {
    const sync = (event: Event) => {
      if ((event.target as Element).localName === 'cr-theme-toggle') flushSync(() => setTheme((event as CustomEvent<string>).detail));
    };
    document.addEventListener('crChange', sync);
    return () => document.removeEventListener('crChange', sync);
  }, [setTheme]);
  return null;
}

// data-theme en plus de la classe dark : les composants Cristal des exemples suivent le thème de la doc.
export function Provider({ lang, children }: { lang: string; children: ReactNode }) {
  return (
    <RootProvider search={{ SearchDialog }} i18n={i18nUI.provider(lang)} theme={{ attribute: ['class', 'data-theme'] }}>
      <ThemeToggleSync />
      {children}
    </RootProvider>
  );
}
