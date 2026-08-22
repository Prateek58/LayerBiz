export async function fetchBlogPosts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://127.0.0.1:1337'}/api/blog-posts?populate=*`, {
    headers: {
      Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
    },
    cache: 'no-store'
  });
  
  if (!res.ok) {
    console.error('Failed to fetch blog posts from Strapi');
    return [];
  }
  
  const json = await res.json();
  return json.data.map((item: any) => {
    const slug = item.slug || item.documentId || item.id;
    return {
      ...item,
      id: slug,
      slug: slug,
    };
  });
}

export async function fetchBlogPost(slugOrId: string) {
  // We search by slug or documentId
  const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://127.0.0.1:1337'}/api/blog-posts?filters[$or][0][slug][$eq]=${slugOrId}&filters[$or][1][documentId][$eq]=${slugOrId}&populate=*`, {
    headers: {
      Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
    },
    cache: 'no-store'
  });
  
  if (!res.ok) {
    console.error(`Failed to fetch blog post ${slugOrId} from Strapi`);
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
}

export async function fetchAboutPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://127.0.0.1:1337'}/api/about-page`, {
    headers: {
      Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
    },
    cache: 'no-store'
  });
  
  if (!res.ok) {
    console.error('Failed to fetch about page from Strapi');
    return null;
  }
  
  const json = await res.json();
  return json.data;
}

