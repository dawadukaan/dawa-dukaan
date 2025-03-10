import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Initialize Firebase with settings from database or environment variables
const initializeFirebaseClient = async () => {
  // If Firebase is already initialized, return the existing instance
  if (getApps().length > 0) {
    return getApps()[0];
  }
  
  try {
    // Try to get settings from database
    const response = await fetch('/api/settings?name=firebase');
    const data = await response.json();
    
    let firebaseConfig;
    
    if (data.setting && data.setting.keyValue) {
      // Use settings from database
      firebaseConfig = data.setting.keyValue;
    } else {
      // Fallback to environment variables
      firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
      };
    }
    
    // Initialize Firebase
    return initializeApp(firebaseConfig);
  } catch (error) {
    console.error('Error initializing Firebase client:', error);
    
    // Fallback to environment variables
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    };
    
    return initializeApp(firebaseConfig);
  }
};

// Get Firebase app instance
let app;
if (typeof window !== 'undefined') {
  // Only initialize in browser environment
  app = initializeFirebaseClient();
}

// Get messaging instance (will only work in browser environment)
let messaging = null;

// Request permission and get token
export const requestNotificationPermission = async () => {
  try {
    if (typeof window === 'undefined') return null;
    
    // Ensure app is initialized
    const firebaseApp = await app;
    
    // Initialize messaging if not already done
    if (!messaging) {
      try {
        messaging = getMessaging(firebaseApp);
      } catch (error) {
        console.error('Firebase messaging initialization error:', error);
        return null;
      }
    }
    
    // Check if notification permission is granted
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }
    
    // Get Firebase settings for VAPID key
    let vapidKey;
    try {
      const response = await fetch('/api/settings?name=firebase');
      const data = await response.json();
      vapidKey = data.setting?.keyValue?.vapidKey || process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    } catch (error) {
      console.error('Error fetching VAPID key:', error);
      vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    }
    
    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey
    });
    
    if (token) {
      console.log('FCM Token:', token);
      return token;
    } else {
      console.log('No registration token available');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

// Handle foreground messages
export const onMessageListener = () => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !messaging) {
      resolve(null);
      return;
    }
    
    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      resolve(payload);
    });
  });
};

export default app;