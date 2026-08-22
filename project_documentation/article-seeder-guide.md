# LayerBiz Article Management & Automated Seeder Guide

This guide explains how your blog articles are stored, authored in Markdown, and synchronized to **Local** and **Production** Strapi databases.

---

## 1. Safety in Public Repositories (Security Verification)

> [!NOTE]
> The automated seeder script ([backend/scripts/seed-articles.js](file:///Users/prateekbhardwaj/Projects/LayerBiz/backend/scripts/seed-articles.js)) contains **ZERO hardcoded secrets, tokens, or passwords**.
>
> It dynamically reads `STRAPI_API_TOKEN` and `STRAPI_API_URL` from your local environment or `.env` files (which are already in `.gitignore`). It is **100% safe to commit and push to your public GitHub repository**.

---

## 2. The 5 Articles in `/blogs`

All articles are saved as clean Markdown documents with frontmatter in the [blogs/](file:///Users/prateekbhardwaj/Projects/LayerBiz/blogs/) folder:

1. **`01-80-20-enterprise-nextjs-strapi-seo.md`**:
   * *Title*: The 80/20 Rule for Enterprise Next.js & Strapi SEO
   * *Slug*: `80-20-rule-enterprise-nextjs-strapi-seo`
   * *Key insight*: Implementing Schema.org JSON-LD, OpenGraph, and XML sitemaps with zero editorial overhead.
2. **`02-how-to-prompt-ai-coding-agents.md`**:
   * *Title*: From Chaos to Precision: How to Prompt AI Coding Agents for Production Apps
   * *Slug*: `how-to-prompt-ai-coding-agents`
   * *Key insight*: The 3-step Intent-Constraint-Verification prompt framework to get production architectures without temporary hacks.
3. **`03-why-strapi-v5-dropped-numeric-ids.md`**:
   * *Title*: Why Strapi v5 Dropped Static Numeric IDs (And Why Slugs Save Your Life)
   * *Slug*: `why-strapi-v5-dropped-numeric-ids`
   * *Key insight*: Strapi 5's Document Service, Draft & Publish state machines, and resilient slug routing.
4. **`04-zero-cost-anti-bot-honeypot-protection.md`**:
   * *Title*: Zero-Cost, Zero-Friction Anti-Bot Protection for Modern Web Forms
   * *Slug*: `zero-cost-anti-bot-honeypot-protection`
   * *Key insight*: Why Google reCAPTCHA hurts UX and how invisible honeypots + sub-second time traps stop 100% of bot spam for free.
5. **`05-decoupled-micro-saas-architecture.md`**:
   * *Title*: Decoupled Architectures: Building a High-Performance Micro-SaaS Studio with Next.js 14 & Headless CMS
   * *Slug*: `decoupled-micro-saas-architecture`
   * *Key insight*: Next.js 14 App Router + Strapi CRM + instant Nodemailer Gmail alert gateway.

---

## 3. How to Run the Seeder

### A. Seeding Local Development:
Make sure your local Strapi is running on port `1337`, then run:
```bash
node backend/scripts/seed-articles.js
```

### B. Seeding Remote Production via SSH:
1. Connect to your VPS server via SSH:
   ```bash
   ssh your-user@your-server-ip
   ```
2. Navigate to your project directory:
   ```bash
   cd /path/to/LayerBiz
   ```
3. Pull the latest code:
   ```bash
   git pull origin main
   ```
4. Run the seeder (it automatically reads your `.env.production` file):
   ```bash
   node backend/scripts/seed-articles.js
   ```

*(Alternatively, you can pass the environment variables inline:)*
```bash
STRAPI_API_URL="http://127.0.0.1:1337" STRAPI_API_TOKEN="your_production_token" node backend/scripts/seed-articles.js
```

---

## 4. Writing New Articles in the Future

To add a new article in the future:
1. Create a new `.md` file in `blogs/your-article-name.md`.
2. Add the frontmatter header:
   ```yaml
   ---
   title: "Your Article Title"
   slug: "your-article-slug"
   category: "Architecture"
   date: "Aug 2026"
   readTime: "6 min read"
   tags: ["Next.js", "AI", "Engineering"]
   excerpt: "Short 1-2 sentence preview for search results and social cards."
   ---
   ```
3. Write your content in Markdown below the header.
4. Run `node backend/scripts/seed-articles.js` — the script will automatically detect the new file, create it in Strapi, and publish it!
