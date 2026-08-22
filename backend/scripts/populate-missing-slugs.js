const mysql = require('mysql2/promise');
require('dotenv').config();

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function populateMissingSlugs() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST || '127.0.0.1',
    port: process.env.DATABASE_PORT || 3306,
    user: process.env.DATABASE_USERNAME || 'root',
    password: process.env.DATABASE_PASSWORD || 'root123',
    database: process.env.DATABASE_NAME || 'layerbizdb',
  });

  try {
    const [posts] = await connection.execute('SELECT id, title, slug FROM blog_posts');
    for (const post of posts) {
      if (!post.slug || post.slug === 'blog-post') {
        const newSlug = slugify(post.title || `post-${post.id}`);
        await connection.execute('UPDATE blog_posts SET slug = ? WHERE id = ?', [newSlug, post.id]);
        console.log(`Updated post #${post.id} "${post.title}" -> slug: ${newSlug}`);
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await connection.end();
  }
}

populateMissingSlugs();
