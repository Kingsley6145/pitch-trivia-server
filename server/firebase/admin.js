const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.error('\n❌ ERROR: .env file not found!');
  console.error('Please create a .env file in the server/ directory.');
  console.error('You can copy env.example as a template:\n');
  console.error('  cp env.example .env\n');
  console.error('Or on Windows:');
  console.error('  copy env.example .env\n');
  process.exit(1);
}

// Validate required environment variables
const requiredVars = ['FIREBASE_PROJECT_ID', 'FIREBASE_PRIVATE_KEY', 'FIREBASE_CLIENT_EMAIL'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('\n❌ ERROR: Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`  - ${varName}`);
  });
  console.error('\nPlease update your .env file with the correct values.\n');
  process.exit(1);
}

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: privateKey,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
    });
    
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('\n❌ Firebase Admin initialization error:', error.message);
    console.error('\nPlease check your .env file configuration.');
    console.error('Make sure:');
    console.error('  1. FIREBASE_PROJECT_ID is set correctly');
    console.error('  2. FIREBASE_PRIVATE_KEY includes the full key with \\n characters');
    console.error('  3. FIREBASE_CLIENT_EMAIL matches your service account email\n');
    process.exit(1);
  }
}

let db, auth;

try {
  db = admin.database();
  auth = admin.auth();
} catch (error) {
  console.error('❌ Error accessing Firebase services:', error.message);
  process.exit(1);
}

module.exports = { admin, db, auth };

