'use strict';
async function main() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  app.log.level = 'error';

  // Add permission to public
  const publicRole = await strapi.query('plugin::users-permissions.role').findOne({ where: { type: 'public' } });
  try {
    await strapi.query('plugin::users-permissions.permission').create({
      data: { action: `api::blog-post.blog-post.find`, role: publicRole.id },
    });
    await strapi.query('plugin::users-permissions.permission').create({
      data: { action: `api::blog-post.blog-post.findOne`, role: publicRole.id },
    });
  } catch(e) {}

  const posts = [
    {
      title: "The Architecture of Zero-Latency Edge Systems",
      date: "Oct 24, 2023",
      readTime: "8 min read",
      excerpt: "Deep dive into how we achieved sub-50ms latency across global clusters for our DataLayer protocol.",
      category: "Engineering",
      tags: ["Rust", "Infrastructure", "Edge"],
      content: `This is a simulated read view. In a production environment, this would render full Markdown or CMS content.

Building robust edge systems requires a fundamental shift in how we perceive data consistency and availability. At LayerBiz, we leverage a combination of global edge workers and localized caching strategies to ensure our users experience zero perceived lag.

\`\`\`javascript
// Sample configuration for edge orchestration
export const config = {
  runtime: 'edge',
  regions: ['fra1', 'sfo1', 'sin1'],
  cacheStrategy: 'stale-while-revalidate'
};
\`\`\`

The transition to React 19 has enabled us to optimize our server component patterns, reducing initial bundle sizes by nearly 40%. This is critical for our micro-SaaS ecosystem where every millisecond counts toward conversion and user satisfaction.`
    }
  ];

  for (const post of posts) {
    await strapi.documents('api::blog-post.blog-post').create({
      data: {
        ...post,
        publishedAt: Date.now()
      }
    });
  }

  console.log("Blog posts added!");
  await app.destroy();
  process.exit(0);
}
main().catch(console.error);
