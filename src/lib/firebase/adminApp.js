import admin from 'firebase-admin';
import { getSettings } from '@/lib/db/services/settingsService';

// Track initialization state
let isInitializing = false;
let initializationPromise = null;

// Initialize Firebase Admin with dynamic configuration
const initializeFirebaseAdmin = async () => {
  // If already initializing, return the existing promise
  if (isInitializing) {
    return initializationPromise;
  }

  // If Firebase admin is already initialized, return the existing instance
  if (admin.apps.length > 0) {
    return admin;
  }

  try {
    isInitializing = true;
    initializationPromise = (async () => {
      // Get Firebase Admin settings from database
      const firebaseAdminSettings = await getSettings('firebase-admin');
      
      // If admin settings exist, use them
      if (firebaseAdminSettings?.projectId && 
          firebaseAdminSettings?.clientEmail && 
          firebaseAdminSettings?.privateKey) {
        
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: firebaseAdminSettings.projectId,
            clientEmail: firebaseAdminSettings.clientEmail,
            privateKey: firebaseAdminSettings.privateKey.replace(/\\n/g, '\n'),
          }),
          databaseURL: `https://${firebaseAdminSettings.projectId}.firebaseio.com`,
        });
        
        console.log('Firebase Admin initialized with database settings');
        return admin;
      }
      
      // Fallback to environment variables
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
      
      // Check if we have the required credentials
      if (!projectId || !clientEmail || !privateKey) {
        throw new Error('Missing Firebase Admin credentials. Please configure Firebase Admin in settings or environment variables.');
      }

      // Initialize with service account from environment variables
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        databaseURL: `https://${projectId}.firebaseio.com`,
      });
      
      console.log('Firebase Admin initialized with environment variables');
      return admin;
    })();
    
    return await initializationPromise;
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
    isInitializing = false;
    initializationPromise = null;
    throw error;
  } finally {
    isInitializing = false;
  }
};

// Export a function to get the admin instance
export const getFirebaseAdmin = async () => {
  return await initializeFirebaseAdmin();
};

// For compatibility with existing code, export a function that returns the admin object
// This ensures that any code using the default export will get a properly initialized admin
export default {
  messaging: async () => {
    const adminInstance = await initializeFirebaseAdmin();
    return adminInstance.messaging();
  },
  // Add other Firebase Admin services as needed
  apps: admin.apps
};