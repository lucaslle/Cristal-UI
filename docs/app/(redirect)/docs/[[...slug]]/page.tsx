import { Redirect } from '@/components/redirect';
import { source } from '@/lib/source';

/** Pages renommées depuis leur mise en ligne. */
const renamed: Record<string, string> = { 'composants/tableau-de-bord': 'composants/grille-deplacable' };

/** Les liens d'avant la version anglaise (/docs/…) menaient à des pages en français. */
export default async function OldDocsPage(props: PageProps<'/docs/[[...slug]]'>) {
  const { slug = [] } = await props.params;
  const path = slug.map(decodeURIComponent).join('/');
  const target = renamed[path] ?? path;
  return <Redirect to={`/fr/docs/${target}${target ? '/' : ''}`} />;
}

export function generateStaticParams() {
  const pages = source.generateParams('slug', 'lang').filter((params) => params.lang === 'fr').map(({ slug }) => ({ slug }));
  return [...pages, ...Object.keys(renamed).map((path) => ({ slug: path.split('/') }))];
}
