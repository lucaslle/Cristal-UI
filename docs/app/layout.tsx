import { Inter, Sora } from 'next/font/google';
import { Provider } from '@/components/provider';
import '@cristal/tokens/tokens.css';
import './global.css';

const inter = Inter({
  subsets: ['latin'],
});

const sora = Sora({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-sora',
});

export const metadata = {
  title: 'Cristal',
  description: 'Bibliothèque de Web Components accessibles pour React et Next.js',
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="fr" className={`${inter.className} ${sora.variable}`} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
