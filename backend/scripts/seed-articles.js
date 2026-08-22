#!/usr/bin/env node

/**
 * LayerBiz Automated Article Seeder
 * 
 * Safely seeds all markdown articles from /blogs into Strapi CMS (Local or Remote Production).
 * Reads environment variables from shell or automatically discovers all common .env files.
 * 
 * Usage:
 *   Local: node backend/scripts/seed-articles.js
 *   Prod:  node backend/scripts/seed-articles.js
 *   Or:    STRAPI_API_TOKEN="token" node backend/scripts/seed-articles.js
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

// Helper to load env files from any path
function loadEnvFile(envPath) {
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const colonIdx = trimmed.indexOf('=');
        if (colonIdx > 0) {
          const key = trimmed.substring(0, colonIdx).trim();
          const val = trimmed.substring(colonIdx + 1).trim();
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    });
  }
}

// Check all possible env locations across frontend, backend, and project root
loadEnvFile(path.resolve(__dirname, '../../frontend/.env.production'));
loadEnvFile(path.resolve(__dirname, '../../frontend/.env.local'));
loadEnvFile(path.resolve(__dirname, '../../frontend/.env'));
loadEnvFile(path.resolve(__dirname, '../.env'));
loadEnvFile(path.resolve(__dirname, '../.env.production'));
loadEnvFile(path.resolve(__dirname, '../../.env'));
loadEnvFile(path.resolve(__dirname, '../../.env.production'));

// Also check relative to current working directory
loadEnvFile(path.resolve(process.cwd(), '.env'));
loadEnvFile(path.resolve(process.cwd(), '.env.production'));
loadEnvFile(path.resolve(process.cwd(), '.env.local'));
loadEnvFile(path.resolve(process.cwd(), '../.env'));
loadEnvFile(path.resolve(process.cwd(), '../.env.production'));

// Search for /blogs folder relative to script or cwd
let blogsDir = path.resolve(__dirname, '../../blogs');
if (!fs.existsSync(blogsDir)) {
  blogsDir = path.resolve(__dirname, '../blogs');
}
if (!fs.existsSync(blogsDir)) {
  blogsDir = path.resolve(process.cwd(), 'blogs');
}
if (!fs.existsSync(blogsDir)) {
  blogsDir = path.resolve(process.cwd(), '../blogs');
}

const STRAPI_URL = process.env.STRAPI_API_URL || process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://127.0.0.1:1337';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || '';

console.log(`\n🚀 [LayerBiz Seeder] Connecting to Strapi at: ${STRAPI_URL}`);
if (STRAPI_TOKEN) {
  console.log(`🔑 [LayerBiz Seeder] Authenticated with Strapi API Token (${STRAPI_TOKEN.substring(0, 10)}...)`);
} else {
  console.log(`⚠️  [LayerBiz Seeder] No STRAPI_API_TOKEN found in environment.`);
}

/**
 * Simple Frontmatter Parser (zero external dependencies)
 */
function parseMarkdownFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const match = fileContent.match(/^---([\s\S]*?)---([\s\S]*)$/);

  if (!match) {
    return {
      metadata: {},
      content: fileContent.trim(),
    };
  }

  const rawMeta = match[1];
  const content = match[2].trim();
  const metadata = {};

  rawMeta.split('\n').forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.substring(0, colonIdx).trim();
      let value = line.substring(colonIdx + 1).trim();

      // Clean string quotes
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      } else if (value.startsWith('[') && value.endsWith(']')) {
        try {
          value = JSON.parse(value);
        } catch (e) {
          // fallback string
        }
      }
      metadata[key] = value;
    }
  });

  return { metadata, content };
}

/**
 * Universal JSON Request Helper
 */
function makeRequest(url, method, headers, data) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;

    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: method,
      headers: reqHeaders,
    };

    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const json = body ? JSON.parse(body) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(json);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(json)}`));
          }
        } catch (err) {
          reject(new Error(`Failed to parse response: ${body}`));
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function seed() {
  if (!fs.existsSync(blogsDir)) {
    console.error(`❌ Blogs directory not found at: ${blogsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(blogsDir).filter(f => f.endsWith('.md')).sort();
  console.log(`📚 Found ${files.length} article files in ${blogsDir}.\n`);

  const headers = {};
  if (STRAPI_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
  }

  for (const file of files) {
    const fullPath = path.join(blogsDir, file);
    const { metadata, content } = parseMarkdownFile(fullPath);

    const slug = metadata.slug || file.replace(/\.md$/, '');
    const title = metadata.title || slug;

    const payloadData = {
      title: title,
      slug: slug,
      category: metadata.category || 'Engineering',
      date: metadata.date || 'Aug 2026',
      readTime: metadata.readTime || '5 min read',
      tags: Array.isArray(metadata.tags) ? metadata.tags : ['Engineering'],
      excerpt: metadata.excerpt || '',
      content: content,
      metaTitle: metadata.metaTitle || '',
      metaDescription: metadata.metaDescription || '',
      canonicalUrl: metadata.canonicalUrl || '',
      keywords: Array.isArray(metadata.keywords) ? metadata.keywords : metadata.tags || [],
      publishedAt: new Date().toISOString(),
    };

    try {
      // 1. Check if article already exists by slug
      const checkUrl = `${STRAPI_URL}/api/blog-posts?filters[slug][$eq]=${slug}`;
      const searchRes = await makeRequest(checkUrl, 'GET', headers);

      if (searchRes.data && searchRes.data.length > 0) {
        // Update existing article
        const existingId = searchRes.data[0].documentId || searchRes.data[0].id;
        const updateUrl = `${STRAPI_URL}/api/blog-posts/${existingId}`;
        await makeRequest(updateUrl, 'PUT', headers, { data: payloadData });
        console.log(`[Updated]  "${title}" (${slug})`);
      } else {
        // Create new article
        const createUrl = `${STRAPI_URL}/api/blog-posts`;
        await makeRequest(createUrl, 'POST', headers, { data: payloadData });
        console.log(`[Created]  "${title}" (${slug})`);
      }
    } catch (error) {
      console.error(`[Error] Failed to seed "${title}":`, error.message);
    }
  }

  console.log(`\nAll articles successfully synced to Strapi!\n`);
}

seed();
