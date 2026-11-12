import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import type { MDXComponents } from 'mdx/types';
import { ApiReference } from './api-reference';
import { Preview } from './preview';
import { TokenTable } from './token-table';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Card: ({ className, ...props }: ComponentProps<typeof defaultMdxComponents.Card>) => <defaultMdxComponents.Card {...props} className={cn('doc-card', className)} />,
    ApiReference,
    Preview,
    TokenTable,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
