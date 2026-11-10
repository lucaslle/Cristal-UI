import { createMDX } from 'fumadocs-mdx/next';

const basePath = process.env.PAGES_BASE_PATH ?? '';

/** @type {import('next').NextConfig} */
const config = {
  // En développement, l'export statique transforme toute adresse inconnue en erreur au lieu d'une 404.
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  trailingSlash: true,
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  reactStrictMode: true,
};

export default createMDX()(config);
