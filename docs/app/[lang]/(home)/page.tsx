import { Hero } from '@/components/home/hero';
import { Pledge } from '@/components/home/promise';
import { Showcase } from '@/components/home/showcase';
import { ThemePlay } from '@/components/home/theme-play';

export default async function HomePage({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params;
  return (
    <main className="flex flex-1 flex-col">
      <Hero lang={lang} />
      <Showcase lang={lang} />
      <ThemePlay lang={lang} />
      <Pledge lang={lang} />
    </main>
  );
}
