# LayerBiz Blog & Engineering Hub: Roadmap & Feature Tracker

This document tracks completed features and prioritized future enhancements across reader experience, social distribution, conversion optimization, and headless infrastructure.

---

## 1. Completed Features (What Is Done)

| Feature / System | Category | Implementation Details | Status |
| :--- | :--- | :--- | :--- |
| **Decoupled Architecture** | Architecture | Next.js 14 App Router paired with Strapi v5 Document Service | Done |
| **Sub-50ms ISR Caching** | Performance | Replaced `no-store` with Tagged ISR (`revalidate: 3600`, `tags: ['blog-posts']`) | Done |
| **On-Demand Cache Purging** | Performance | Created `/api/revalidate` route supporting GET and POST webhook triggers | Done |
| **Smart Differential Seeder** | DevOps | Node.js sync engine (`seed-articles.js`) with content diffing to skip unchanged posts | Done |
| **Safe Orphan Prune Mode** | DevOps | `--prune` CLI flag in seeder to safely reconcile deleted markdown files in Strapi | Done |
| **Google Analytics 4** | Analytics | Integrated GA4 (`G-XRBZD4CLET`) using Next.js `next/script` with `afterInteractive` | Done |
| **80/20 Dynamic SEO** | SEO | Dynamic Schema.org JSON-LD (BlogPosting, Organization), OpenGraph, XML sitemaps | Done |
| **Syntax Highlighting** | UI/UX | Prism syntax highlighter (`vscDarkPlus`) supporting all major programming languages | Done |
| **Related Articles Rail** | UI/UX | Automatic category and tag matching for related posts at article footer | Done |
| **Contact & Newsletter APIs** | Lead Gen | Nodemailer Gmail gateway with sub-second honeypot anti-spam protection | Done |

---

## 2. Priority Roadmap (What To Do Next)

### Category A: Reader Experience & Usability

| Task | Priority | Description | Target Implementation |
| :--- | :--- | :--- | :--- |
| **1-Click "Copy Code" Button** | High | Add a floating "Copy" / "Copied" badge on all code snippets with clipboard API fallback. | Frontend React Markdown renderer |
| **Sticky Table of Contents (TOC)** | High | Add a collapsible/sticky sidebar TOC with active scroll-spy heading tracking for long articles. | Article layout component |
| **Top Reading Progress Bar** | Medium | A sleek orange reading indicator fixed at the top of the viewport tracking scroll depth. | Global / Article layout |
| **Estimated Reading Time Calculator** | Low | Dynamic word count and reading time algorithm fallback for user-submitted articles. | Frontmatter / Seeder utility |

---

### Category B: Viral Distribution & Social SEO

| Task | Priority | Description | Target Implementation |
| :--- | :--- | :--- | :--- |
| **Dynamic OpenGraph Image Generation** | High | Generate dynamic 1200x630 branded social share cards with post title using `@vercel/og`. | `app/blog/[id]/opengraph-image.tsx` |
| **Global RSS & Atom Feeds** | High | Expose `/rss.xml` and `/feed.json` for technical aggregators (Hacker News, Daily.dev, Feedly). | `app/rss.xml/route.ts` |
| **Native Social Share Buttons** | Medium | One-click pre-filled share links for X (Twitter), LinkedIn, and Reddit at the end of posts. | Article footer component |

---

### Category C: Conversion & Audience Retention

| Task | Priority | Description | Target Implementation |
| :--- | :--- | :--- | :--- |
| **In-Article Newsletter Box** | High | Sleek terminal-styled email capture widget placed between article conclusion and footer. | `components/InArticleNewsletter.tsx` |
| **Command Palette Search (`Cmd + K`)** | Medium | Global fuzzy search modal across article titles, tags, and excerpts. | `components/SearchModal.tsx` |
| **Tag & Category Filter Pages** | Medium | Dedicated archive pages for individual tags (`/blog/tag/nextjs`, `/blog/category/security`). | `app/blog/category/[slug]/page.tsx` |

---

### Category D: Infrastructure & CI/CD Enhancements

| Task | Priority | Description | Target Implementation |
| :--- | :--- | :--- | :--- |
| **GitHub Environments Setup** | Medium | Configure `frontend-production` and `backend-production` credential boundaries in GitHub repo. | GitHub Settings & Actions |
| **Strapi Webhook Connection** | Low | Link Strapi publish/unpublish events to `https://layerbiz.com/api/revalidate`. | Strapi Admin Webhooks |
| **Automated S3/R2 Media Storage** | Low | Offload uploaded media and images from local VPS disk to Cloudflare R2 / AWS S3. | Strapi Provider Upload Plugin |

---

## 3. How to Update This Tracker

1. When completing an item from Section 2, move it to the **Completed Features** table in Section 1 with a summary of the implementation.
2. Add any newly discovered feature requests or technical debt directly under the relevant category with priority tags.
