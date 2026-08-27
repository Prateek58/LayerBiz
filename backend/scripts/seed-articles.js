#!/usr/bin/env node

/**
 * LayerBiz Smart Article Seeder & Sync Engine
 * 
 * Safely syncs markdown articles from /blogs into Strapi CMS (Local or Remote Production).
 * 
 * Features:
 * - Smart Differential Sync: Only writes to DB if content or metadata has actually changed.
 * - Leaves untouched articles intact (preserving Strapi timestamps, SEO last-modified dates, and cache).
 * - Safe Prune Mode (--prune): Deletes orphaned posts from Strapi if their markdown file was removed.
 * - Single-file targeting: Seed all or only specific articles.
 * - Zero external dependencies.
 * 
 * Usage:
 *   Sync all (smart diff):  node backend/scripts/seed-articles.js
 *   Sync specific file:     node backend/scripts/seed-articles.js blogs/08-my-post.md
 *   Prune deleted posts:    node backend/scripts/seed-articles.js --prune
 *   Force update all:       node backend/scripts/seed-articles.js --force
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

// Parse CLI flags
const cliArgs = process.argv.slice(2);
const isForce = cliArgs.includes('--force');
const isPrune = cliArgs.includes('--prune');
const targetArg = cliArgs.find(arg => !arg.startsWith('--'));

console.log(`\n[LayerBiz Seeder] Connecting to Strapi at: ${STRAPI_URL}`);
if (STRAPI_TOKEN) {
  console.log(`[LayerBiz Seeder] Authenticated with Strapi API Token (${STRAPI_TOKEN.substring(0, 10)}...)`);
} else {
  console.log(`[LayerBiz Seeder] No STRAPI_API_TOKEN found in environment.`);
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

/**
 * Deep Equality Check for Content and Metadata
 */
function normalizeText(str) {
  return (str || '').replace(/\r\n/g, '\n').trim();
}

function areArraysEqual(arr1, arr2) {
  const a = Array.isArray(arr1) ? arr1 : [];
  const b = Array.isArray(arr2) ? arr2 : [];
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, idx) => val === sortedB[idx]);
}

function hasArticleChanged(existing, incoming) {
  if (normalizeText(existing.title) !== normalizeText(incoming.title)) return true;
  if (normalizeText(existing.content) !== normalizeText(incoming.content)) return true;
  if (normalizeText(existing.excerpt) !== normalizeText(incoming.excerpt)) return true;
  if (normalizeText(existing.category) !== normalizeText(incoming.category)) return true;
  if (normalizeText(existing.readTime) !== normalizeText(incoming.readTime)) return true;
  if (normalizeText(existing.metaTitle) !== normalizeText(incoming.metaTitle)) return true;
  if (normalizeText(existing.metaDescription) !== normalizeText(incoming.metaDescription)) return true;
  if (normalizeText(existing.canonicalUrl) !== normalizeText(incoming.canonicalUrl)) return true;
  if (!areArraysEqual(existing.tags, incoming.tags)) return true;
  if (!areArraysEqual(existing.keywords, incoming.keywords)) return true;

  return false;
}

async function seed() {
  if (!fs.existsSync(blogsDir)) {
    console.error(`Blogs directory not found at: ${blogsDir}`);
    process.exit(1);
  }

  if (isPrune && targetArg) {
    console.error(`Safety Error: --prune cannot be used with a single target file (${targetArg}) to prevent accidental deletions.`);
    process.exit(1);
  }

  let allLocalFiles = fs.readdirSync(blogsDir).filter(f => f.endsWith('.md')).sort();
  let filesToProcess = allLocalFiles;

  // If a single file/target was passed as argument, filter to it
  if (targetArg) {
    const targetBase = path.basename(targetArg);
    filesToProcess = filesToProcess.filter(f => f === targetBase || f.includes(targetArg));
    if (filesToProcess.length === 0) {
      console.error(`Specified file "${targetArg}" not found in ${blogsDir}`);
      process.exit(1);
    }
  }

  console.log(`Scanning ${filesToProcess.length} article(s) in ${blogsDir}${isForce ? ' (Force Mode)' : ''}${isPrune ? ' (Prune Mode Enabled)' : ''}...\n`);

  const headers = {};
  if (STRAPI_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
  }

  const stats = {
    created: 0,
    updated: 0,
    unchanged: 0,
    pruned: 0,
    errors: 0,
  };

  const localSlugs = new Set();

  for (const file of filesToProcess) {
    const fullPath = path.join(blogsDir, file);
    const { metadata, content } = parseMarkdownFile(fullPath);

    const slug = metadata.slug || file.replace(/\.md$/, '');
    const title = metadata.title || slug;
    localSlugs.add(slug);

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
      // 1. Check if article already exists in Strapi by slug
      const checkUrl = `${STRAPI_URL}/api/blog-posts?filters[slug][$eq]=${encodeURIComponent(slug)}`;
      const searchRes = await makeRequest(checkUrl, 'GET', headers);

      if (searchRes.data && searchRes.data.length > 0) {
        const existingRecord = searchRes.data[0];
        const existingId = existingRecord.documentId || existingRecord.id;

        if (!isForce && !hasArticleChanged(existingRecord, payloadData)) {
          // Content is identical - skip write
          stats.unchanged++;
          console.log(`[Unchanged] "${title}" (${slug})`);
        } else {
          // Content or metadata changed - update
          const updateUrl = `${STRAPI_URL}/api/blog-posts/${existingId}`;
          await makeRequest(updateUrl, 'PUT', headers, { data: payloadData });
          stats.updated++;
          console.log(`[Updated]   "${title}" (${slug})`);
        }
      } else {
        // Article does not exist - create
        const createUrl = `${STRAPI_URL}/api/blog-posts`;
        await makeRequest(createUrl, 'POST', headers, { data: payloadData });
        stats.created++;
        console.log(`[Created]   "${title}" (${slug})`);
      }
    } catch (error) {
      stats.errors++;
      console.error(`[Error]     Failed to sync "${title}":`, error.message);
    }
  }

  // Handle Pruning if requested (Only during full scan)
  if (isPrune && !targetArg) {
    try {
      // Also collect all slugs from any files that might exist
      allLocalFiles.forEach(f => {
        const { metadata } = parseMarkdownFile(path.join(blogsDir, f));
        localSlugs.add(metadata.slug || f.replace(/\.md$/, ''));
      });

      const listUrl = `${STRAPI_URL}/api/blog-posts?pagination[pageSize]=1000`;
      const allStrapiRes = await makeRequest(listUrl, 'GET', headers);

      if (allStrapiRes.data && Array.isArray(allStrapiRes.data)) {
        for (const remotePost of allStrapiRes.data) {
          const remoteSlug = remotePost.slug;
          const remoteId = remotePost.documentId || remotePost.id;

          if (remoteSlug && !localSlugs.has(remoteSlug)) {
            const deleteUrl = `${STRAPI_URL}/api/blog-posts/${remoteId}`;
            await makeRequest(deleteUrl, 'DELETE', headers);
            stats.pruned++;
            console.log(`[Pruned]    "${remotePost.title || remoteSlug}" (${remoteSlug}) - removed from Strapi`);
          }
        }
      }
    } catch (error) {
      stats.errors++;
      console.error(`[Error]     Failed during prune phase:`, error.message);
    }
  }

  console.log(`\n========================================`);
  console.log(`Sync Summary:`);
  console.log(`  Created:   ${stats.created}`);
  console.log(`  Updated:   ${stats.updated}`);
  console.log(`  Unchanged: ${stats.unchanged}`);
  if (isPrune) {
    console.log(`  Pruned:    ${stats.pruned}`);
  }
  if (stats.errors > 0) {
    console.log(`  Errors:    ${stats.errors}`);
  }
  console.log(`========================================\n`);
}

seed();
