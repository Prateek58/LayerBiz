# LayerBiz Dynamic SEO Strategy & CMS Guide (RankMath 80/20 Engine)

This document provides complete instructions on how the **Dynamic SEO Engine** works and how to manage SEO fields in Strapi.

---

## 1. How It Works: The "Smart Override" Cascade

You **do NOT need to fill out SEO fields** every time you write a post. The system automatically falls back to your regular content:

```
┌────────────────────────┐       Is it filled in Strapi?
│   metaTitle in Strapi  ├─────────────► YES ──► Use custom SEO Title
└────────────────────────┘               │
                                         ▼ NO
                                Use: post.title + " | LayerBiz"
```

```
┌──────────────────────────────┐   Is it filled in Strapi?
│  metaDescription in Strapi   ├────────► YES ──► Use custom Google snippet
└──────────────────────────────┘          │
                                          ▼ NO
                                 Use: post.excerpt
```

```
┌──────────────────────────────┐   Is it filled in Strapi?
│   canonicalUrl in Strapi     ├────────► YES ──► Use custom canonical link
└──────────────────────────────┘          │
                                          ▼ NO
                                 Use: https://layerbiz.com/blog/[slug]
```

```
┌──────────────────────────────┐   Is it filled in Strapi?
│     keywords in Strapi       ├────────► YES ──► Use custom target keywords
└──────────────────────────────┘          │
                                          ▼ NO
                                 Use: post.tags (e.g. ["Rust", "Edge"])
```

---

## 2. Managing Blog SEO in Strapi Admin

When creating or editing a post in **Content Manager $\rightarrow$ Blog Posts**:

### Basic Post Content (Required for the blog):
* **`title`**: The article title displayed on the website.
* **`slug`**: The clean URL slug (auto-generated from title, e.g. `the-architecture-of-zero-latency`).
* **`excerpt`**: Short summary shown on the blog list page.
* **`tags`**: JSON array of tags (e.g. `["Rust", "Micro-SaaS", "Next.js"]`).
* **`content`**: Full Markdown article body.

### Optional SEO Override Fields (Bottom of the form):
* **`metaTitle`** *(Optional)*: Override the Google Search headline. If left blank, uses `<title> | LayerBiz`.
* **`metaDescription`** *(Optional)*: Override the Google Search description snippet (recommended length: 140–160 chars). If left blank, uses your `excerpt`.
* **`canonicalUrl`** *(Optional)*: Set a custom canonical URL if this article was cross-posted from Medium, Substack, or an external publication. If left blank, automatically uses `https://layerbiz.com/blog/<slug>`.
* **`keywords`** *(Optional)*: Custom JSON array of target keywords (e.g. `["edge workers", "low latency database"]`). If left blank, uses your post `tags`.

---

## 3. Automated Technical SEO Features (Zero-Maintenance)

1. **Schema.org Rich Snippets (JSON-LD)**:
   * Every article automatically injects a Google-compliant **`BlogPosting`** structured data object into the page.
   * Google displays rich cards with author, publisher logo, headline, and publication date in search results.
2. **Automated XML Sitemap**:
   * Accessible at `https://layerbiz.com/sitemap.xml`
   * Automatically updates when you publish or update posts in Strapi.
3. **Robots.txt**:
   * Accessible at `https://layerbiz.com/robots.txt`
   * Instructs Googlebot and search crawlers to index public pages while protecting private API endpoints.
4. **Social Share Previews (OpenGraph & Twitter Cards)**:
   * Generates formatted cards when links are shared on X/Twitter, LinkedIn, Discord, and Slack.

---

## 4. Best Practices for Writing High-Ranking Posts

1. **Target Long-Tail Developer Queries**:
   * E.g., *"How We Built an Edge Cache in Next.js 14"* instead of just *"Edge Caching"*.
2. **First Paragraph Clarity**:
   * State the main problem and solution in the first 2 sentences. Search engines use this to match user intent.
3. **Use Descriptive Headings**:
   * Use `## Heading 2` for major takeaways.
   * Use code blocks (````typescript ... ````) with syntax language specified for code snippets.
4. **Use Concise Excerpts**:
   * Keep your excerpt between 120 and 160 characters. It acts as both your website preview and Google's primary search snippet.
