const { createStrapi, compileStrapi } = require('@strapi/strapi');
const http = require('http');
const path = require('path');
const fs = require('fs');

const updatedAboutData = {
  title: "The LayerBiz Protocol & Philosophy",
  paragraphs: [
    "We believe software is the fundamental leverage layer of modern business. We architect and build specialized, high-performance micro-SaaS products and practical AI workflows that solve complex problems with surgical precision.",
    "Founded for developers, solopreneurs, and fast-moving agencies who value lean architecture, zero-bloat code, and pragmatic AI execution. Every product, tool, and architectural blueprint in our ecosystem is engineered to be resilient, remarkably fast, and privacy-first.",
    "From edge-native architectures and zero-latency caching to automated AI task orchestrators, we document our engineering decisions in the open to help the community build, operate, and scale sustainable technology."
  ],
  features: [
    { num: "01", title: "Lean Systems", desc: "Sub-50ms latency, zero-dependency tools, and edge compute." },
    { num: "02", title: "Pragmatic AI", desc: "Task-driven orchestrators & practical workflows for builders." },
    { num: "03", title: "Micro-SaaS Velocity", desc: "Decoupled architectures for rapid prototype-to-production." },
    { num: "04", title: "Open Engineering", desc: "Publication-grade technical logs, blueprints, and transparent telemetry." }
  ]
};

// Helper to load env
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

async function tryRestApiMigration() {
  const strapiUrl = process.env.STRAPI_API_URL || process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://127.0.0.1:1337';
  const strapiToken = process.env.STRAPI_API_TOKEN;

  console.log(`[About Migration] Attempting REST API update to ${strapiUrl}...`);

  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(`${strapiUrl}/api/about-page`);
    const postData = JSON.stringify({ data: updatedAboutData });

    const req = http.request({
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 1337,
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
          console.log('[About Migration] Successfully updated About Page via REST API!');
          resolve(true);
        } else {
          // If PUT fails, try POST
          const postReq = http.request({
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || 1337,
            path: parsedUrl.pathname,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(postData),
              ...(strapiToken ? { 'Authorization': `Bearer ${strapiToken}` } : {})
            }
          }, (postRes) => {
            if (postRes.statusCode >= 200 && postRes.statusCode < 300) {
              console.log('[About Migration] Successfully created About Page via REST API!');
              resolve(true);
            } else {
              reject(new Error(`REST API returned HTTP ${postRes.statusCode}: ${body}`));
            }
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
  console.log('[About Migration] Loading Strapi direct bootstrap...');
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  try {
    const existing = await app.documents('api::about-page.about-page').findFirst();
    if (existing) {
      await app.documents('api::about-page.about-page').update({
        documentId: existing.documentId,
        data: updatedAboutData,
        status: 'published'
      });
      console.log('[About Migration] Successfully updated About Page in Strapi DB!');
    } else {
      await app.documents('api::about-page.about-page').create({
        data: updatedAboutData,
        status: 'published'
      });
      console.log('[About Migration] Successfully created About Page in Strapi DB!');
    }
  } finally {
    await app.destroy();
  }
}

async function main() {
  try {
    // Try REST API first (if Strapi is running)
    await tryRestApiMigration();
  } catch (apiErr) {
    console.log(`[About Migration] REST API not reachable (${apiErr.message}). Falling back to direct database bootstrap...`);
    try {
      await tryDirectBootstrapMigration();
    } catch (dbErr) {
      console.error('[About Migration] Direct DB migration error:', dbErr.message);
    }
  }
  process.exit(0);
}

main();
