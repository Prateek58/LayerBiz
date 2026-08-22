const mysql = require('mysql2/promise');
require('dotenv').config();

async function resetLayout() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST || '127.0.0.1',
    port: process.env.DATABASE_PORT || 3306,
    user: process.env.DATABASE_USERNAME || 'root',
    password: process.env.DATABASE_PASSWORD || 'root123',
    database: process.env.DATABASE_NAME || 'layerbizdb',
  });

  try {
    // Delete any cached content manager configuration for blog-post
    const [result] = await connection.execute(
      "DELETE FROM strapi_core_store_settings WHERE `key` LIKE '%plugin_content_manager_configuration_content_types::api::blog-post.blog-post%'"
    );
    console.log('Successfully reset blog-post Content Manager layout cache. Rows affected:', result.affectedRows);
  } catch (err) {
    console.error('Error resetting layout:', err.message);
  } finally {
    await connection.end();
  }
}

resetLayout();
