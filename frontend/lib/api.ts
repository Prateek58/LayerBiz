export async function fetchBlogPosts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://127.0.0.1:1337'}/api/blog-posts`, {
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
  // Map Strapi's response format to match our frontend interface
  return json.data.map((item: any) => ({
    id: item.id,
    ...item
  }));
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

