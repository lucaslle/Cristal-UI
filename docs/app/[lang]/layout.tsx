import { Instrument_Serif, Inter } from 'next/font/google';
import { Provider } from '@/components/provider';
import '@cristal-ui/react/tokens.css';
import '@cristal-ui/react/tokens-dark.css';
import '../global.css';
import { i18n, type Lang } from '@/lib/i18n';

const inter = Inter({
  subsets: ['latin'],
});

const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-serif',
});

const descriptions: Record<Lang, string> = {
  en: 'Accessible web components for React and Next.js',
  fr: 'Bibliothèque de Web Components accessibles pour React et Next.js',
};

export async function generateMetadata({ params }: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  return { title: 'Cristal', description: descriptions[lang as Lang] };
}

export function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }));
}

// La langue de la page règle aussi celle des textes intégrés aux composants Cristal.
export default async function Layout({ children, params }: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  return (
    <html lang={lang} className={`${inter.className} ${serif.variable}`} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Provider lang={lang}>{children}</Provider>
      </body>
    </html>
  );
}
