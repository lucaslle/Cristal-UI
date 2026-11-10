import Link from 'next/link';
import type { ReactNode } from 'react';
import AccordionPanels from '@/demos/accordion-panels';
import DashboardBasic from '@/demos/dashboard-basic';
import IconButtonBadge from '@/demos/icon-button-badge';
import MenuActions from '@/demos/menu-actions';
import OtpBasic from '@/demos/otp-basic';
import SelectSearchable from '@/demos/select-searchable';
import TableOrders from '@/demos/table-orders';
import TextareaBasic from '@/demos/textarea-basic';

type Tile = { title: string; text: string; href: string; demo: ReactNode; wide?: 2 | 3 };

const tiles: Tile[] = [
  { title: 'Tableau de bord', text: 'Glissez les cartes, tirez leur coin, tout se réarrange. Au clavier aussi.', href: 'tableau-de-bord', demo: <DashboardBasic />, wide: 2 },
  { title: 'Code à usage unique', text: 'Une case par chiffre, collage d’un code entier, passage automatique.', href: 'code', demo: <OtpBasic /> },
  { title: 'Accordéon en panneaux', text: 'Le panneau choisi s’élargit, les autres se replient en douceur.', href: 'accordeon', demo: <AccordionPanels />, wide: 2 },
  { title: 'Menus animés', text: 'Six animations d’ouverture, navigation complète au clavier.', href: 'menu', demo: <MenuActions /> },
  { title: 'Tableau', text: 'Chaque utilisateur range, fixe, masque et élargit ses colonnes, et le tableau s’en souvient.', href: 'tableau', demo: <TableOrders />, wide: 3 },
  { title: 'Listes avec recherche', text: 'Filtre local ou recherche côté serveur, choix simple ou multiple.', href: 'liste-deroulante', demo: <SelectSearchable /> },
  { title: 'Boutons icône', text: 'Infobulle, bascule, pastille qui rebondit quand elle change.', href: 'bouton-icone', demo: <IconButtonBadge /> },
  { title: 'Zone de texte', text: 'Grandit d’une ligne à la fois, sans saut.', href: 'zone-de-texte', demo: <TextareaBasic /> },
];

const span = { 2: 'lg:col-span-2', 3: 'lg:col-span-3' };

export function Showcase() {
  return (
    <section id="composants" className="mx-auto w-full max-w-7xl scroll-mt-20 px-6 py-24">
      <p className="text-sm font-semibold uppercase tracking-widest text-fd-primary">Composants</p>
      <h2 className="font-display mt-3 max-w-3xl text-4xl font-bold sm:text-5xl">Touchez-les : tout ce que vous voyez ici fonctionne.</h2>
      <p className="mt-4 max-w-2xl text-lg text-fd-muted-foreground">Pas de captures d&apos;écran : chaque carte est le vrai composant, celui que vous installez.</p>
      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {tiles.map((tile) => (
          <article key={tile.title} className={`tile ${tile.wide ? span[tile.wide] : ''}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-xl font-bold">{tile.title}</h3>
              <Link href={`/docs/composants/${tile.href}`} className="text-sm font-semibold text-fd-primary underline-offset-4 hover:underline">
                Documentation <span className="sr-only">: {tile.title}</span>
                <span aria-hidden="true"> →</span>
              </Link>
            </div>
            <p className="text-fd-muted-foreground">{tile.text}</p>
            <div className="tile-demo">{tile.demo}</div>
          </article>
        ))}
      </div>
    </section>
  );
}
