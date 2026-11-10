import { source } from '@/lib/source';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import { ApiReference } from '@/components/api-reference';
import { TokenTable } from '@/components/token-table';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';

export default async function Page(props: PageProps<'/[lang]/docs/[[...slug]]'>) {
  const params = await props.params;
  const page = source.getPage(params.slug, params.lang);
  if (!page) notFound();

  const MDX = page.data.body;
  const RelativeLink = createRelativeLink(source, page);

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle className="docs-title">{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // Les liens /docs/… des pages restent dans la langue lue.
            a: ({ href, ...props }) => <RelativeLink {...props} href={href?.startsWith('/docs') ? `/${params.lang}${href}` : href} />,
            ApiReference: (props) => <ApiReference {...props} lang={params.lang} />,
            TokenTable: (props) => <TokenTable {...props} lang={params.lang} />,
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams('slug', 'lang');
}

export async function generateMetadata(props: PageProps<'/[lang]/docs/[[...slug]]'>): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug, params.lang);
  if (!page) notFound();

  return { title: `${page.data.title} — Cristal`, description: page.data.description };
}
