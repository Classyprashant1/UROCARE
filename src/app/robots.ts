import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://urocareapolo.com'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/api/', '/_next/', '/auth/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
