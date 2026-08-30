const { createStrapi, compileStrapi } = require('@strapi/strapi');
const http = require('http');
const https = require('https');
const path = require('path');
const fs = require('fs');

const recommendedGlobalData = {
  siteName: "LayerBiz",
  siteDescription: "LayerBiz is a venture studio specializing in high-performance micro-SaaS, edge architectures, zero-latency protocols, and AI orchestration.",
  defaultSeo: {
    metaTitle: "LayerBiz - High-Performance Micro-SaaS Venture Studio",
    metaDescription: "We bridge the gap between complex edge engineering and elegant micro-SaaS user experiences. Discover our edge-native tools, architectural blueprints, and pragmatic AI orchestrators."
  }
};

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
          if (!process.env[key]) process.env[key] = val;
        }
      }
    });
  }
}

loadEnvFile(path.resolve(__dirname, '../../frontend/.env.local'));
loadEnvFile(path.resolve(__dirname, '../.env'));

function parseArgs() {
  const args = process.argv.slice(2);
  const params = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) {
      params.url = args[i + 1];
      i++;
    } else if (args[i] === '--token' && args[i + 1]) {
      params.token = args[i + 1];
      i++;
    }
  }
  return params;
}

async function tryRestApiMigration(targetUrl, targetToken) {
  const strapiUrl = targetUrl || process.env.STRAPI_API_URL || process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://127.0.0.1:1337';
  const strapiToken = targetToken || process.env.STRAPI_API_TOKEN;

  console.log(`[Global Migration] Attempting REST API update to ${strapiUrl}...`);

  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(`${strapiUrl}/api/global`);
    const postData = JSON.stringify({ data: recommendedGlobalData });
    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    const req = client.request({
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...(strapiToken ? { 'Authorization': `Bearer ${strapiToken}` } : {})
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`[Global Migration] Successfully updated Global settings on ${strapiUrl}!`);
          resolve(true);
        } else {
          // If PUT fails, try POST
          const postReq = client.request({
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || (isHttps ? 443 : 80),
            path: parsedUrl.pathname,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(postData),
              ...(strapiToken ? { 'Authorization': `Bearer ${strapiToken}` } : {})
            }
          }, (postRes) => {
            let postBody = '';
            postRes.on('data', chunk => postBody += chunk);
            postRes.on('end', () => {
              if (postRes.statusCode >= 200 && postRes.statusCode < 300) {
                console.log(`[Global Migration] Successfully created Global settings on ${strapiUrl}!`);
                resolve(true);
              } else {
                reject(new Error(`REST API returned HTTP ${postRes.statusCode}: ${postBody || body}`));
              }
            });
          });
          postReq.on('error', reject);
          postReq.write(postData);
          postReq.end();
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function tryDirectBootstrapMigration() {
  console.log('[Global Migration] Loading Strapi direct bootstrap for local database...');
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  try {
    const existing = await app.documents('api::global.global').findFirst();
    if (existing) {
      await app.documents('api::global.global').update({
        documentId: existing.documentId,
        data: recommendedGlobalData,
        status: 'published'
      });
      console.log('[Global Migration] Successfully updated Global settings in local Strapi DB!');
    } else {
      await app.documents('api::global.global').create({
        data: recommendedGlobalData,
        status: 'published'
      });
      console.log('[Global Migration] Successfully created Global settings in local Strapi DB!');
    }
  } finally {
    await app.destroy();
  }
}

async function main() {
  const cliArgs = parseArgs();

  if (cliArgs.url) {
    console.log(`Targeting specified remote URL: ${cliArgs.url}`);
    try {
      await tryRestApiMigration(cliArgs.url, cliArgs.token);
    } catch (err) {
      console.error(`[Global Migration] Error migrating to ${cliArgs.url}:`, err.message);
    }
    return;
  }

  // Default: migrate localhost
  try {
    await tryRestApiMigration('http://127.0.0.1:1337');
  } catch (apiErr) {
    console.log(`[Global Migration] Local REST API error (${apiErr.message}). Attempting direct DB bootstrap...`);
    try {
      await tryDirectBootstrapMigration();
    } catch (dbErr) {
      console.error('[Global Migration] Direct DB migration error:', dbErr.message);
    }
  }
}

main().catch(console.error);
