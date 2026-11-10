import { Redirect } from '@/components/redirect';
import { source } from '@/lib/source';

/** Les liens d'avant la version anglaise (/docs/…) menaient à des pages en français. */
export default async function OldDocsPage(props: PageProps<'/docs/[[...slug]]'>) {
  const { slug = [] } = await props.params;
  return <Redirect to={`/fr/docs/${slug.map(encodeURIComponent).join('/')}${slug.length ? '/' : ''}`} />;
}

export function generateStaticParams() {
  return source.generateParams('slug', 'lang').filter((params) => params.lang === 'fr').map(({ slug }) => ({ slug }));
}
