---
title: "Why Strapi v5 Dropped Static Numeric IDs (And Why Slugs Save Your Life)"
slug: "why-strapi-v5-dropped-numeric-ids"
category: "Database"
date: "Aug 22, 2026"
readTime: "6 min read"
tags: ["Strapi", "Next.js", "Databases", "Web Architecture"]
excerpt: "An architectural deep-dive into Strapi 5's Document Service, why internal numeric database IDs mutate across drafts, and why URL slugs are the definitive standard for headless routing."
metaTitle: "Why Strapi v5 Dropped Static Numeric IDs | LayerBiz"
metaDescription: "Understand Strapi 5's new Document Service architecture. Learn why internal database IDs shift during content updates and how to implement resilient slug-based routing in Next.js."
keywords: ["Strapi v5", "Document Service", "Strapi Slugs", "Next.js Dynamic Routing", "Headless CMS Database"]
---

# Why Strapi v5 Dropped Static Numeric IDs (And Why Slugs Save Your Life)

One of the biggest surprises developers encounter when upgrading from Strapi v4 to **Strapi v5** is the behavior of the database `id` field.

In older versions, every content entry had a permanent numeric primary key (e.g. `id: 12`). In Strapi v5, however, editing and publishing content can cause that numeric ID to shift or mutate behind the scenes.

If your frontend routes rely on numeric IDs like `/blog/12`, your site will inevitably break. Here is the architectural reason behind this change and why **URL Slugs** are the permanent solution.

---

## 1. The Strapi v5 Document Service Architecture

In Strapi v5, the core engineering team introduced the **Document Service**. This architecture decouples a conceptual "document" from its underlying physical SQL database rows.

| Document State | Physical Database Row | Behavior |
| :--- | :--- | :--- |
| **Draft Version** | DB Row `#14` (`status: draft`) | Staged changes visible only in Admin |
| **Published Version** | DB Row `#15` (`status: published`) | Live content served to public API consumers |
| **Canonical Identifier** | `documentId` / `slug` | Permanent semantic key across all drafts |

When you edit an article with **Draft & Publish** enabled:
1. Strapi generates a temporary draft row with its own internal SQL auto-increment ID (`#14`).
2. When you hit **Publish**, Strapi commits the live version to a new or updated row (`#15`).
3. The internal numeric `id` is simply a transient database index, **NOT** a permanent identity.

---

## 2. Why URL Slugs Are Mandatory

In modern web development, routing by database ID is an anti-pattern for two major reasons:
* **SEO**: Search engines favor descriptive keywords in URLs (`layerbiz.com/blog/zero-latency-edge`) over opaque numbers (`layerbiz.com/blog/15`).
* **Immutability**: A slug represents the permanent semantic identifier of the article. Even if the internal database structure or CMS version is overhauled, the URL remains permanent.

---

## 3. Implementing Auto-Slugs in Strapi v5

In your Strapi content type schema, configure a `uid` field targeting the title:

```json
{
  "attributes": {
    "title": {
      "type": "string",
      "required": true
    },
    "slug": {
      "type": "uid",
      "targetField": "title"
    }
  }
}
```

### Adding a Backend Lifecycle Hook (`lifecycles.ts`):
To guarantee that a slug is never left blank or corrupted, attach a lifecycle hook:

```typescript
// backend/src/api/blog-post/content-types/blog-post/lifecycles.ts
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default {
  beforeCreate(event: any) {
    const { data } = event.params;
    if (data.title && !data.slug) {
      data.slug = slugify(data.title);
    }
  },
  beforeUpdate(event: any) {
    const { data } = event.params;
    if (data.title && !data.slug) {
      data.slug = slugify(data.title);
    }
  },
};
```

---

## 4. Querying by Slug in Next.js

On the frontend, query the Strapi REST API using filter operators rather than numeric IDs:

```typescript
// frontend/lib/api.ts
export async function fetchBlogPost(slug: string) {
  const res = await fetch(
    `${STRAPI_URL}/api/blog-posts?filters[slug][$eq]=${slug}&populate=*`,
    { cache: 'no-store' }
  );

  const json = await res.json();
  return json.data?.[0] || null;
}
```

---

## Summary

Strapi v5's Document Service is a major leap forward for enterprise content workflows, draft staging, and localization. By embracing **Slugs** as first-class citizens in your schema, your Next.js application gains bulletproof stability, better SEO rankings, and clean URL persistence.
