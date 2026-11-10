import Link from 'next/link';
import data from '@/generated/components.json';
import { copyOf } from './copy';
import { CopyCommand } from './copy-command';
import { HeroStage } from './hero-stage';

export function Hero({ lang }: { lang: string }) {
  const c = copyOf(lang);
  return (
    <section className="stage">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-16 px-6 pb-24 pt-20 lg:grid-cols-[1.05fr_1fr] lg:pt-28">
        <div className="flex min-w-0 flex-col items-start gap-8">
          <span className="pill">
            <span aria-hidden="true">◆</span> {c.pill}
          </span>
          <h1 className="font-display text-[2.6rem] font-extrabold leading-[1.05] sm:text-6xl lg:text-7xl">
            {c.title[0]}
            <span className="prism-text">{c.title[1]}</span>
            {c.title[2]}
          </h1>
          <p className="stage-muted max-w-xl text-lg leading-relaxed sm:text-xl">{c.lead}</p>
          <div className="flex flex-wrap gap-3">
            <Link href={`/${lang}/docs/installation`} className="btn-glow">
              {c.start} <span aria-hidden="true">→</span>
            </Link>
            <Link href="#composants" className="btn-ghost">
              {c.browse}
            </Link>
          </div>
          <CopyCommand command="npm install @cristal/react @cristal/tokens" label={c.copyCommand} done={c.copied} />
        </div>
        <HeroStage lang={lang} />
      </div>
      <dl className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-px overflow-hidden border-t border-white/10 lg:grid-cols-4">
        {c.stats(data.components.length).map(([value, label]) => (
          <div key={label} className="flex flex-col gap-1 px-6 py-8">
            <dt className="stage-muted order-2 text-sm">{label}</dt>
            <dd className="font-display prism-text order-1 text-4xl font-bold">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
