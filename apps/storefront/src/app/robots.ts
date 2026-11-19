import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        disallow: ['/partner-strategy', '/partner-strategy/', '/api/partner-strategy'],
      },
    ],
  };
}
