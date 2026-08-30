const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixPermissions() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST || '127.0.0.1',
    port: process.env.DATABASE_PORT || 3306,
    user: process.env.DATABASE_USERNAME || 'root',
    password: process.env.DATABASE_PASSWORD || 'root123',
    database: process.env.DATABASE_NAME || 'layerbizdb',
  });

  try {
    // 1. Check API tokens
    const [tokens] = await connection.execute('SELECT * FROM strapi_api_tokens');
    console.log('Tokens found:', tokens.map(t => ({ id: t.id, name: t.name, type: t.type })));

    // 2. If token is custom, grant permissions or set token to full-access
    for (const t of tokens) {
      if (t.type !== 'full-access') {
        await connection.execute("UPDATE strapi_api_tokens SET `type` = 'full-access' WHERE id = ?", [t.id]);
        console.log(`Updated token #${t.id} (${t.name}) to full-access`);
      }
    }

    // 3. Also grant public role permissions to create/find if needed
    const [publicRoles] = await connection.execute("SELECT id FROM strapi_roles WHERE `type` = 'public'");
    if (publicRoles.length > 0) {
      const publicRoleId = publicRoles[0].id;
      const actions = [
        'api::contact-inquiry.contact-inquiry.create',
        'api::contact-inquiry.contact-inquiry.find',
        'api::newsletter-subscriber.newsletter-subscriber.create',
        'api::newsletter-subscriber.newsletter-subscriber.find',
        'api::newsletter-subscriber.newsletter-subscriber.findOne',
        'api::comment.comment.create',
        'api::comment.comment.find',
        'api::comment.comment.findOne'
      ];

      for (const action of actions) {
        const [existing] = await connection.execute(
          "SELECT id FROM strapi_permissions WHERE `action` = ? AND `role_id` = ?",
          [action, publicRoleId]
        );
        if (existing.length === 0) {
          await connection.execute(
            "INSERT INTO strapi_permissions (`action`, `role_id`, `created_at`, `updated_at`) VALUES (?, ?, NOW(), NOW())",
            [action, publicRoleId]
          );
          console.log(`Granted public permission: ${action}`);
        }
      }
    }

    console.log('Permissions successfully updated!');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await connection.end();
  }
}

fixPermissions();
