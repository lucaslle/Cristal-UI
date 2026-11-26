import Link from 'next/link';
import data from '@/generated/components.json';
import { copyOf } from './copy';
import { HeroStage } from './hero-stage';

export function Hero({ lang }: { lang: string }) {
  const c = copyOf(lang);
  return (
    <section className="border-b">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 py-16 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:py-24">
        <div className="flex min-w-0 flex-col items-start gap-6">
          <h1 className="font-display text-5xl leading-[1.02] sm:text-6xl lg:text-7xl">{c.title}</h1>
          <p className="max-w-xl text-lg leading-relaxed text-fd-muted-foreground">{c.lead}</p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Link href={`/${lang}/docs/installation`} className="btn-primary">
              {c.start}
            </Link>
            <Link href="#composants" className="btn-secondary">
              {c.browse}
            </Link>
          </div>
        </div>
        <HeroStage lang={lang} />
      </div>
      <dl className="mx-auto grid w-full max-w-7xl grid-cols-2 border-t lg:grid-cols-4">
        {c.stats(data.components.length).map(([value, label]) => (
          <div key={label} className="flex flex-col gap-1 px-6 py-8">
            <dt className="order-2 text-sm text-fd-muted-foreground">{label}</dt>
            <dd className="font-display order-1 text-4xl tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
