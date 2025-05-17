import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // disallow: '/private/',
    },
    sitemap: 'https://www.talexus.ai/sitemap.xml', // Your sitemap URL
  }
}
