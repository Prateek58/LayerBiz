export async function fetchBlogPosts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://127.0.0.1:1337'}/api/blog-posts?sort[0]=publishedAt:desc&sort[1]=createdAt:desc&sort[2]=id:desc&populate=*`, {
      headers: {
        Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
      },
      next: {
        tags: ['blog-posts'],
        revalidate: 3600, // 1 hour background revalidation
      },
    });
    
    if (!res.ok) {
      console.error('Failed to fetch blog posts from Strapi. HTTP status:', res.status);
      return [];
    }
    
    const json = await res.json();
    if (!json.data || !Array.isArray(json.data)) {
      return [];
    }

    return json.data.map((item: any) => {
      const slug = item.slug || item.documentId || item.id;
      return {
        ...item,
        id: slug,
        slug: slug,
      };
    });
  } catch (error: any) {
    console.error('Network error fetching blog posts from Strapi:', error?.message || error);
    return [];
  }
}

export async function fetchBlogPost(slugOrId: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://127.0.0.1:1337'}/api/blog-posts?filters[$or][0][slug][$eq]=${slugOrId}&filters[$or][1][documentId][$eq]=${slugOrId}&populate=*`, {
      headers: {
        Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
      },
      next: {
        tags: ['blog-posts', `blog-post-${slugOrId}`],
        revalidate: 3600, // 1 hour background revalidation
      },
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch blog post ${slugOrId} from Strapi. HTTP status:`, res.status);
      return null;
    }
    
    const json = await res.json();
    if (!json.data || json.data.length === 0) {
      return null;
    }

    const item = json.data[0];
    const slug = item.slug || item.documentId || item.id;
    return {
      ...item,
      id: slug,
      slug: slug,
    };
  } catch (error: any) {
    console.error(`Network error fetching blog post ${slugOrId} from Strapi:`, error?.message || error);
    return null;
  }
}

export async function fetchAboutPage() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://127.0.0.1:1337'}/api/about-page`, {
      headers: {
        Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
      },
      next: {
        tags: ['about-page'],
        revalidate: 3600, // 1 hour background revalidation
      },
    });
    
    if (!res.ok) {
      console.error('Failed to fetch about page from Strapi. HTTP status:', res.status);
      return null;
    }
    
    const json = await res.json();
    return json.data;
  } catch (error: any) {
    console.error('Network error fetching about page from Strapi:', error?.message || error);
    return null;
  }
}

