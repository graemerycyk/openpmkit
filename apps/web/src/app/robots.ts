import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/demo/console/'],
    },
    sitemap: 'https://getpmkit.com/sitemap.xml',
  };
}

