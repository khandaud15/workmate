import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

// Log environment variables for debugging (without exposing the private key)
const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
console.log('[Firebase Storage] Initializing with bucket:', bucketName);
console.log('[Firebase Storage] Project ID:', process.env.FIREBASE_PROJECT_ID);

if (!bucketName) {
  console.error('[Firebase Storage] ERROR: No bucket name specified in FIREBASE_STORAGE_BUCKET environment variable');
}

// Fix for private key formatting
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

// Handle different formats of private key
if (privateKey) {
  // Replace escaped newlines with actual newlines if needed
  if (privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
    console.log('[Firebase Storage] Fixed newlines in private key');
  }
} else {
  console.error('[Firebase Storage] ERROR: No private key found in environment variables');
}

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: privateKey,
};

let app;
if (!getApps().length) {
  console.log('[Firebase Storage] Initializing new Firebase Admin app');
  app = initializeApp({
    credential: cert(serviceAccount as any),
    storageBucket: bucketName,
  });
} else {
  console.log('[Firebase Storage] Using existing Firebase Admin app');
  app = getApp();
}

// Get storage with explicit bucket name
const storage = getStorage(app);

// Verify bucket is properly configured
try {
  const bucket = storage.bucket();
  console.log('[Firebase Storage] Bucket name from storage:', bucket.name);
} catch (error) {
  console.error('[Firebase Storage] Error accessing bucket:', error);
}

export { storage };
