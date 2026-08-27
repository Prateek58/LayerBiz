# LayerBiz Article Management & Automated Seeder Guide

This guide explains how your blog articles are stored, authored in Markdown, and synchronized to **Local** and **Production** Strapi databases.

---

## 1. Safety in Public Repositories (Security Verification)

> [!NOTE]
> The automated seeder script ([backend/scripts/seed-articles.js](file:///Users/prateekbhardwaj/Projects/LayerBiz/backend/scripts/seed-articles.js)) contains **ZERO hardcoded secrets, tokens, or passwords**.
>
> It dynamically reads `STRAPI_API_TOKEN` and `STRAPI_API_URL` from your local environment or `.env` files (which are already in `.gitignore`). It is **100% safe to commit and push to your public GitHub repository**.

---

## 2. Content Storage Architecture

All blog articles are stored directly as standard Markdown files inside the `/blogs` folder. 

* The **`/blogs` directory is the single source of truth**.
* You do **not** need to manually maintain a list of posts in documentation.
* To view all published or drafted articles, simply inspect the files inside `/blogs/`.

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
