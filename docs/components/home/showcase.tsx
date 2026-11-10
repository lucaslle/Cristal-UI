import Link from 'next/link';
import type { ComponentType } from 'react';
import AccordionPanels from '@/demos/accordion-panels';
import DashboardBasic from '@/demos/dashboard-basic';
import AccordionPanelsEn from '@/demos/en/accordion-panels';
import DashboardBasicEn from '@/demos/en/dashboard-basic';
import IconButtonBadgeEn from '@/demos/en/icon-button-badge';
import MenuActionsEn from '@/demos/en/menu-actions';
import OtpBasicEn from '@/demos/en/otp-basic';
import SelectSearchableEn from '@/demos/en/select-searchable';
import TableOrdersEn from '@/demos/en/table-orders';
import TextareaBasicEn from '@/demos/en/textarea-basic';
import IconButtonBadge from '@/demos/icon-button-badge';
import MenuActions from '@/demos/menu-actions';
import OtpBasic from '@/demos/otp-basic';
import SelectSearchable from '@/demos/select-searchable';
import TableOrders from '@/demos/table-orders';
import TextareaBasic from '@/demos/textarea-basic';
import { copyOf, type Copy } from './copy';

type Tile = { key: keyof Copy['tiles']; href: string; demo: Record<'en' | 'fr', ComponentType>; wide?: 2 | 3 };

const tiles: Tile[] = [
  { key: 'dashboard', href: 'tableau-de-bord', demo: { en: DashboardBasicEn, fr: DashboardBasic }, wide: 2 },
  { key: 'otp', href: 'code', demo: { en: OtpBasicEn, fr: OtpBasic } },
  { key: 'panels', href: 'accordeon', demo: { en: AccordionPanelsEn, fr: AccordionPanels }, wide: 2 },
  { key: 'menu', href: 'menu', demo: { en: MenuActionsEn, fr: MenuActions } },
  { key: 'table', href: 'tableau', demo: { en: TableOrdersEn, fr: TableOrders }, wide: 3 },
  { key: 'select', href: 'liste-deroulante', demo: { en: SelectSearchableEn, fr: SelectSearchable } },
  { key: 'iconButton', href: 'bouton-icone', demo: { en: IconButtonBadgeEn, fr: IconButtonBadge } },
  { key: 'textarea', href: 'zone-de-texte', demo: { en: TextareaBasicEn, fr: TextareaBasic } },
];

const span = { 2: 'lg:col-span-2', 3: 'lg:col-span-3' };

export function Showcase({ lang }: { lang: string }) {
  const c = copyOf(lang);
  const language = lang === 'fr' ? 'fr' : 'en';
  return (
    <section id="composants" className="mx-auto w-full max-w-7xl scroll-mt-20 px-6 py-24">
      <p className="text-sm font-semibold uppercase tracking-widest text-fd-primary">{c.componentsKicker}</p>
      <h2 className="font-display mt-3 max-w-3xl text-4xl font-bold sm:text-5xl">{c.componentsTitle}</h2>
      <p className="mt-4 max-w-2xl text-lg text-fd-muted-foreground">{c.componentsLead}</p>
      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {tiles.map((tile) => {
          const [title, text] = c.tiles[tile.key];
          const Demo = tile.demo[language];
          return (
            <article key={tile.key} className={`tile ${tile.wide ? span[tile.wide] : ''}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-xl font-bold">{title}</h3>
                <Link href={`/${lang}/docs/composants/${tile.href}`} className="text-sm font-semibold text-fd-primary underline-offset-4 hover:underline">
                  {c.docs} <span className="sr-only">: {title}</span>
                  <span aria-hidden="true"> →</span>
                </Link>
              </div>
              <p className="text-fd-muted-foreground">{text}</p>
              <div className="tile-demo">
                <Demo />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
