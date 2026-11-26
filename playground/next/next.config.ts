import type { NextConfig } from 'next';

// Same defaults as create-next-app, so the build checks the SSR components under Cache Components.
const nextConfig: NextConfig = { cacheComponents: true, partialPrefetching: true };

export default nextConfig;
