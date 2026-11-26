import Link from 'next/link';
import { copyOf } from './copy';
import { CopyCommand } from './copy-command';

export function Pledge({ lang }: { lang: string }) {
  const c = copyOf(lang);
  return (
    <>
      <section className="mx-auto w-full max-w-7xl px-6 py-24">
        <p className="text-sm font-medium text-fd-muted-foreground">{c.a11yKicker}</p>
        <h2 className="font-display mt-2 max-w-3xl text-3xl font-semibold sm:text-4xl">{c.a11yTitle}</h2>
        <ul className="mt-12 grid gap-px overflow-hidden rounded-2xl border bg-fd-border sm:grid-cols-2 lg:grid-cols-3">
          {c.promises.map(([title, text]) => (
            <li key={title} className="flex flex-col gap-2 bg-fd-background p-6">
              <h3 className="font-medium">{title}</h3>
              <p className="text-fd-muted-foreground">{text}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="border-t">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">{c.ctaTitle}</h2>
          <p className="max-w-xl text-lg text-fd-muted-foreground">{c.ctaLead}</p>
          <CopyCommand command="npm install @cristal-ui/react" label={c.copyCommand} done={c.copied} />
          <div className="flex flex-wrap justify-center gap-3">
            <Link href={`/${lang}/docs/installation`} className="btn-primary">
              {c.install}
            </Link>
            <Link href={`/${lang}/docs/accessibilite`} className="btn-secondary">
              {c.pledge}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
