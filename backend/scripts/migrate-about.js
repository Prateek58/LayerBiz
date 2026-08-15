const { createStrapi, compileStrapi } = require('@strapi/strapi');

async function seedAboutPage() {
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  const aboutData = {
    title: "The LayerBiz Protocol",
    paragraphs: [
      "We believe software is the fundamental layer of modern business. Our mission is to build specialized, high-performance micro-SaaS that solves complex problems with surgical precision.",
      "Founded by developers who value code quality, user privacy, and zero-bloat architecture. Every product in our ecosystem is built to be resilient and remarkably fast."
    ],
    features: [
      { num: "01", title: "Lean Systems" },
      { num: "02", title: "Human Design" }
    ]
  };

  try {
    const existing = await app.documents('api::about-page.about-page').findFirst();
    if (existing) {
      await app.documents('api::about-page.about-page').update({
        documentId: existing.documentId,
        data: aboutData,
        status: 'published'
      });
      console.log('Updated About Page');
    } else {
      await app.documents('api::about-page.about-page').create({
        data: aboutData,
        status: 'published'
      });
      console.log('Created About Page');
    }
  } catch (e) {
    console.error(e);
  }

  await app.destroy();
  process.exit(0);
}

seedAboutPage();
