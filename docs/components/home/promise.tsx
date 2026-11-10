import Link from 'next/link';
import { Logo } from '@/components/logo';
import { copyOf } from './copy';

export function Pledge({ lang }: { lang: string }) {
  const c = copyOf(lang);
  return (
    <>
      <section className="mx-auto w-full max-w-7xl px-6 py-24">
        <p className="text-sm font-semibold uppercase tracking-widest text-fd-primary">{c.a11yKicker}</p>
        <h2 className="font-display mt-3 max-w-3xl text-4xl font-bold sm:text-5xl">{c.a11yTitle}</h2>
        <ul className="mt-12 grid gap-px overflow-hidden rounded-3xl border bg-fd-border sm:grid-cols-2 lg:grid-cols-3">
          {c.promises.map(([title, text]) => (
            <li key={title} className="flex flex-col gap-2 bg-fd-background p-8">
              <span className="grid size-10 place-items-center rounded-xl bg-fd-primary text-fd-primary-foreground" aria-hidden="true">
                ✓
              </span>
              <h3 className="font-display text-lg font-bold">{title}</h3>
              <p className="text-fd-muted-foreground">{text}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="stage">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 px-6 py-24 text-center">
          <Logo size={56} />
          <h2 className="font-display text-4xl font-extrabold sm:text-6xl">
            {c.ctaTitle[0]}
            <span className="prism-text">{c.ctaTitle[1]}</span>
            {c.ctaTitle[2]}
          </h2>
          <p className="stage-muted max-w-xl text-lg">{c.ctaLead}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href={`/${lang}/docs/installation`} className="btn-glow">
              {c.install} <span aria-hidden="true">→</span>
            </Link>
            <Link href={`/${lang}/docs/accessibilite`} className="btn-ghost">
              {c.pledge}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
