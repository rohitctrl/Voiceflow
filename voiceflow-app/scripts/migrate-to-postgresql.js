#!/usr/bin/env node

/**
 * Migration script for PostgreSQL deployment on Netlify
 * Run this after setting up your PostgreSQL database
 */

const { execSync } = require('child_process');
const path = require('path');

async function migrateToPostgreSQL() {
  console.log('🔄 Starting PostgreSQL migration...');
  
  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    
    if (!process.env.DATABASE_URL.startsWith('postgresql://')) {
      throw new Error('DATABASE_URL must be a PostgreSQL connection string');
    }
    
    console.log('✅ DATABASE_URL is configured for PostgreSQL');
    
    // Generate Prisma client
    console.log('📦 Generating Prisma client...');
    execSync('npx prisma generate', { 
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..')
    });
    
    // Run database migrations
    console.log('🗄️  Running database migrations...');
    execSync('npx prisma migrate deploy', { 
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..')
    });
    
    console.log('✅ PostgreSQL migration completed successfully!');
    console.log('🚀 Your app is ready for Netlify deployment');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\n🔧 Make sure you have:');
    console.error('   1. Set DATABASE_URL to a PostgreSQL connection string');
    console.error('   2. Database is accessible from your current location');
    console.error('   3. Required packages are installed (npm install)');
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateToPostgreSQL();
}

module.exports = { migrateToPostgreSQL };