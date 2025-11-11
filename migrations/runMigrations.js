const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Database Migration Runner
 * Executes SQL migration files in order
 */

const runMigrations = async () => {
  // Create PostgreSQL client
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 
      `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
  });

  try {
    console.log('🔄 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully\n');

    // Get all migration files in order
    const migrationFiles = [
      '001_create_users_table.sql',
      '002_create_tasks_table.sql'
    ];

    // Run each migration
    for (const file of migrationFiles) {
      const filePath = path.join(__dirname, file);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Migration file not found: ${file}`);
        continue;
      }

      console.log(`📄 Running migration: ${file}`);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      await client.query(sql);
      console.log(`✅ Migration completed: ${file}\n`);
    }

    console.log('🎉 All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n👋 Database connection closed');
  }
};

// Run migrations
runMigrations();

