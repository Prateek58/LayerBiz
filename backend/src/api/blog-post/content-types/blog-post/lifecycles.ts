function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default {
  beforeCreate(event: any) {
    const { data } = event.params;
    if (data.title && (!data.slug || data.slug === 'blog-post')) {
      data.slug = slugify(data.title);
    }
  },
  beforeUpdate(event: any) {
    const { data } = event.params;
    if (data.title && (!data.slug || data.slug === 'blog-post')) {
      data.slug = slugify(data.title);
    }
  },
};
