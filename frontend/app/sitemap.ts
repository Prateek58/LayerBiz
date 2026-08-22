import { MetadataRoute } from 'next';

export const revalidate = 3600; // Revalidate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://layerbiz.com';
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://127.0.0.1:1337';
  const strapiToken = process.env.STRAPI_API_TOKEN;

  // 1. Static Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/microsaas`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${siteUrl}/newsletter`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // 2. Dynamic Blog Routes from Strapi
  try {
    const res = await fetch(`${strapiUrl}/api/blog-posts?populate=*`, {
      headers: {
        ...(strapiToken ? { Authorization: `Bearer ${strapiToken}` } : {}),
      },
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const json = await res.json();
      const dynamicBlogRoutes: MetadataRoute.Sitemap = json.data.map((post: any) => ({
        url: `${siteUrl}/blog/${post.slug || post.documentId || post.id}`,
        lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));

      return [...staticRoutes, ...dynamicBlogRoutes];
    }
  } catch (error) {
    console.error('Error generating dynamic blog sitemap:', error);
  }

  return staticRoutes;
}
