#!/usr/bin/env node

import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error(
      '❌ Database connection failed:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    return false;
  }
}

async function checkUserTableExists() {
  try {
    // Try to query the user table
    await prisma.$queryRaw`SELECT 1 FROM "user" LIMIT 1`;
    console.log('✅ User table exists');
    return true;
  } catch {
    console.log('❌ User table not found');
    return false;
  }
}

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');

    // Generate Prisma client
    console.log('📦 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // Run migrations
    console.log('🚀 Running migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });

    console.log('✅ Database migrations completed successfully');
    return true;
  } catch (error) {
    console.error(
      '❌ Error running migrations:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    return false;
  }
}

async function main() {
  try {
    console.log('🔍 Checking database schema...');

    // First check if we can connect to the database
    const canConnect = await checkDatabaseConnection();
    if (!canConnect) {
      console.error(
        '❌ Cannot connect to database. Please check your DATABASE_URL environment variable.',
      );
      process.exit(1);
    }

    const userTableExists = await checkUserTableExists();

    if (!userTableExists) {
      console.log('📋 User table not found. Running migrations...');
      const migrationSuccess = await runMigrations();

      if (!migrationSuccess) {
        console.error('❌ Failed to run migrations. Exiting...');
        process.exit(1);
      }

      // Verify the migration worked
      const tableExistsAfterMigration = await checkUserTableExists();
      if (!tableExistsAfterMigration) {
        console.error('❌ User table still not found after migration. Exiting...');
        process.exit(1);
      }
    }

    console.log('✅ Database is ready');
  } catch (error) {
    console.error(
      '❌ Error during migration check:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main();
