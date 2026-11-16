/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: { allowedOrigins: ['localhost:3000'] },
  },
  // Production: forward /v1/* to the API so its cookies are first-party on this domain.
  async rewrites() {
    const origin = process.env.API_ORIGIN?.replace(/\/+$/, '');
    return origin ? [{ source: '/v1/:path*', destination: `${origin}/v1/:path*` }] : [];
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};

export default nextConfig;
