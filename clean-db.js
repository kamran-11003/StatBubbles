/**
 * Database Cleanup Script
 * Cleans the specified MongoDB database by dropping it or dropping all its collections.
 * 
 * Usage:
 *   node clean-db.js [optional_mongodb_uri]
 */

const mongoose = require('mongoose');
const readline = require('readline');
const { URL } = require('url');

// Default MongoDB URI provided by the user
const DEFAULT_URI = 'mongodb+srv://statbubbleslive_db_user:Lg4RONahQIPNhnfa@statbubbles.ar28uy5.mongodb.net/?appName=statbubbles';

// Helper to ask question in CLI
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => rl.question(query, (ans) => {
    rl.close();
    resolve(ans.trim());
  }));
}

// Helper to inject/replace database name in connection string
function setDatabaseName(uri, dbName) {
  try {
    const parsed = new URL(uri);
    parsed.pathname = '/' + dbName;
    return parsed.toString();
  } catch (err) {
    console.error('Error parsing URI:', err.message);
    return uri;
  }
}

// Helper to extract database name from URI
function getDatabaseName(uri) {
  try {
    const parsed = new URL(uri);
    const dbName = parsed.pathname.replace(/^\//, '');
    return dbName || null;
  } catch (err) {
    return null;
  }
}

async function run() {
  console.log('🧹 MongoDB Database Cleanup Utility');
  console.log('====================================');

  // 1. Determine the URI
  let uri = process.argv[2] || process.env.MONGODB_URI || DEFAULT_URI;
  
  // Hide password in console logs for security
  const maskedUri = uri.replace(/:([^:@]+)@/, ':******@');
  console.log(`Connection URI: ${maskedUri}`);

  // 2. Determine Database Name
  let dbName = getDatabaseName(uri);
  if (!dbName) {
    console.log('\n⚠️ No database name specified in the connection URI.');
    const inputDb = await askQuestion('Please enter the name of the database you want to clean (default: test): ');
    dbName = inputDb || 'test';
    uri = setDatabaseName(uri, dbName);
  }

  console.log(`Target Database: ${dbName}`);

  // 3. Confirm action
  console.log('\n⚠️  WARNING: This will drop the database or delete all collections inside it! All data will be lost.');
  const confirmation = await askQuestion(`Are you absolutely sure you want to clean database "${dbName}"? (type 'yes' to confirm): `);
  
  if (confirmation.toLowerCase() !== 'yes') {
    console.log('❌ Cleanup cancelled by user.');
    process.exit(0);
  }

  console.log('\n🔄 Connecting to MongoDB...');
  try {
    await mongoose.connect(uri);
    console.log('✅ Connected successfully.');

    // Access the raw database object
    const db = mongoose.connection.db;

    console.log(`\n🧹 Attempting to drop database "${dbName}"...`);
    try {
      await db.dropDatabase();
      console.log(`🎉 Success: Database "${dbName}" dropped completely.`);
    } catch (dropError) {
      console.log(`⚠️  Could not drop database directly (often due to user permissions): ${dropError.message}`);
      console.log('🔄 Falling back to dropping collections individually...');

      // List all collections
      const collections = await db.listCollections().toArray();
      if (collections.length === 0) {
        console.log('ℹ️ No collections found in the database. Nothing to clean.');
      } else {
        console.log(`Found ${collections.length} collections. Dropping them now...`);
        for (const col of collections) {
          try {
            await db.collection(col.name).drop();
            console.log(`  - Dropped collection: ${col.name}`);
          } catch (colError) {
            console.error(`  ❌ Error dropping collection "${col.name}": ${colError.message}`);
          }
        }
        console.log(`🎉 Finished dropping collections.`);
      }
    }

  } catch (error) {
    console.error('❌ Connection or Execution error:', error.message);
  } finally {
    // Ensure mongoose disconnects
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
}

run();
