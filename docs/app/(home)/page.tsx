import { Hero } from '@/components/home/hero';
import { Pledge } from '@/components/home/promise';
import { Showcase } from '@/components/home/showcase';
import { ThemePlay } from '@/components/home/theme-play';

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <Showcase />
      <ThemePlay />
      <Pledge />
    </main>
  );
}
