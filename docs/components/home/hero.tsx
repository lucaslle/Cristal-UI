import Link from 'next/link';
import data from '@/generated/components.json';
import { CopyCommand } from './copy-command';
import { HeroStage } from './hero-stage';

const stats = [
  [`${data.components.length}`, 'composants prêts à l’emploi'],
  ['AA', 'WCAG 2.1 vérifié par axe à chaque modification'],
  ['0', 'flash au chargement avec Next.js'],
  ['1 ligne', 'de CSS pour prendre vos couleurs'],
];

export function Hero() {
  return (
    <section className="stage">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-16 px-6 pb-24 pt-20 lg:grid-cols-[1.05fr_1fr] lg:pt-28">
        <div className="flex min-w-0 flex-col items-start gap-8">
          <span className="pill">
            <span aria-hidden="true">◆</span> Web Components · React · Next.js
          </span>
          <h1 className="font-display text-[2.6rem] font-extrabold leading-[1.05] sm:text-6xl lg:text-7xl">
            Des interfaces <span className="prism-text">qui brillent</span>, accessibles par nature.
          </h1>
          <p className="stage-muted max-w-xl text-lg leading-relaxed sm:text-xl">
            Cristal, ce sont des composants animés et soignés, écrits une fois en Web Components. Ils vont dans React et Next.js, au clavier comme au lecteur d&apos;écran.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/docs/installation" className="btn-glow">
              Commencer <span aria-hidden="true">→</span>
            </Link>
            <Link href="#composants" className="btn-ghost">
              Voir les composants
            </Link>
          </div>
          <CopyCommand command="npm install @cristal/react @cristal/tokens" />
        </div>
        <HeroStage />
      </div>
      <dl className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-px overflow-hidden border-t border-white/10 lg:grid-cols-4">
        {stats.map(([value, label]) => (
          <div key={label} className="flex flex-col gap-1 px-6 py-8">
            <dt className="stage-muted order-2 text-sm">{label}</dt>
            <dd className="font-display prism-text order-1 text-4xl font-bold">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
