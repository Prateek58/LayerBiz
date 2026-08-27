# LayerBiz Article Management & Automated Seeder Guide

This guide explains how your blog articles are stored, authored in Markdown, and synchronized to **Local** and **Production** Strapi databases.

---

## 1. Safety in Public Repositories (Security Verification)

> [!NOTE]
> The automated seeder script ([backend/scripts/seed-articles.js](file:///Users/prateekbhardwaj/Projects/LayerBiz/backend/scripts/seed-articles.js)) contains **ZERO hardcoded secrets, tokens, or passwords**.
>
> It dynamically reads `STRAPI_API_TOKEN` and `STRAPI_API_URL` from your local environment or `.env` files (which are already in `.gitignore`). It is **100% safe to commit and push to your public GitHub repository**.

---

## 2. The 10 Articles in `/blogs`

All articles are saved as clean Markdown documents with frontmatter in the [blogs/](file:///Users/prateekbhardwaj/Projects/LayerBiz/blogs/) folder:

1. **`01-80-20-enterprise-nextjs-strapi-seo.md`**:
   * *Title*: The 80/20 Next.js & Strapi SEO Guide: Automating Schema, OpenGraph, and Sitemaps
   * *Slug*: `80-20-rule-enterprise-nextjs-strapi-seo`
2. **`02-how-to-prompt-ai-coding-agents.md`**:
   * *Title*: From Chaos to Precision: How to Prompt AI Coding Agents for Production Apps
   * *Slug*: `how-to-prompt-ai-coding-agents`
3. **`03-why-strapi-v5-dropped-numeric-ids.md`**:
   * *Title*: Why Strapi v5 Dropped Static Numeric IDs (And Why Slugs Save Your Life)
   * *Slug*: `why-strapi-v5-dropped-numeric-ids`
4. **`04-zero-cost-anti-bot-honeypot-protection.md`**:
   * *Title*: How to Stop 100% of Form Bot Spam Without Annoying CAPTCHAs
   * *Slug*: `zero-cost-anti-bot-honeypot-protection`
5. **`05-decoupled-micro-saas-architecture.md`**:
   * *Title*: Decoupled Architectures: Building a High-Performance Micro-SaaS Studio with Next.js 14 & Headless CMS
   * *Slug*: `decoupled-micro-saas-architecture`
6. **`06-why-we-bet-on-react-19-for-our-enterprise-suite.md`**:
   * *Title*: Why We Bet on React 19 for Our Enterprise Suite
   * *Slug*: `why-we-bet-on-react-19-for-our-enterprise-suite`
7. **`07-securing-micro-saas-a-defense-in-depth-approach.md`**:
   * *Title*: Securing Micro-SaaS: A Defense-in-Depth Approach
   * *Slug*: `securing-micro-saas-a-defense-in-depth-approach`
8. **`08-ai-beyond-chatbots-building-task-orchestrators.md`**:
   * *Title*: AI Beyond Chatbots: Building Task Orchestrators
   * *Slug*: `ai-beyond-chatbots-building-task-orchestrators`
9. **`09-programmatic-content-sync-strapi-production.md`**:
   * *Title*: How to Sync Markdown Files Directly into Strapi (Without Manual CMS Clicking)
   * *Slug*: `programmatic-content-sync-strapi-production`
10. **`10-sub-50ms-headless-caching-nextjs-strapi.md`**:
    * *Title*: How to Fix Slow Next.js & Strapi Page Loads with ISR Caching (From 2s to Sub-50ms)
    * *Slug*: `sub-50ms-headless-caching-nextjs-strapi`

---

## 3. How to Run the Smart Seeder

The seeder uses **Smart Differential Sync**:
* **Untouched articles**: Skipped automatically without database writes, preserving SEO timestamps and avoiding webhook storms.
* **Modified articles**: Only updates the exact articles whose content or metadata changed.
* **New articles**: Creates and publishes newly added markdown files.

### A. Seeding Local Development:
```bash
# Smart sync all articles (only updates changed/new):
node backend/scripts/seed-articles.js

# Sync a specific article only:
node backend/scripts/seed-articles.js blogs/04-zero-cost-anti-bot-honeypot-protection.md

# Safe Prune Mode (deletes orphaned Strapi posts if their .md file was deleted):
node backend/scripts/seed-articles.js --prune

# Force update all articles even if unchanged:
node backend/scripts/seed-articles.js --force
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
4. Run the smart seeder:
   ```bash
   node backend/scripts/seed-articles.js
   # Or with prune if you deleted articles:
   # node backend/scripts/seed-articles.js --prune
   ```

*(Alternatively, you can pass the environment variables inline:)*
```bash
STRAPI_API_URL="http://127.0.0.1:1337" STRAPI_API_TOKEN="your_production_token" node backend/scripts/seed-articles.js
```

---

## 4. Writing & Deleting Articles

### Adding a New Article:
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
4. Run `node backend/scripts/seed-articles.js` — the script will detect the new file, create it in Strapi, and publish it.

### Deleting an Article:
1. Delete the corresponding `.md` file from `/blogs`.
2. Run `node backend/scripts/seed-articles.js --prune` — the script will detect that the slug is gone from Git and safely delete it from Strapi.
