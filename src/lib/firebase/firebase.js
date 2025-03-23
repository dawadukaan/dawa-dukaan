import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase - ensure we only initialize once
let app;
let messaging = null;

// Only initialize Firebase on the client side
if (typeof window !== 'undefined') {
  try {
    // Check if Firebase is already initialized
    if (getApps().length === 0) {
      console.log("Initializing new Firebase app");
      app = initializeApp(firebaseConfig);
    } else {
      console.log("Firebase already initialized, reusing existing app");
      app = getApps()[0];
    }
    
    // Initialize messaging
    try {
      messaging = getMessaging(app);
      console.log("Firebase messaging initialized successfully");
    } catch (error) {
      console.error("Error initializing Firebase messaging:", error);
    }
  } catch (error) {
    console.error("Error initializing Firebase:", error);
  }
}

// Function to request permission and get token
export const requestNotificationPermission = async () => {
  console.log("Requesting notification permission...");
  
  if (!messaging) {
    console.error("Firebase messaging not initialized");
    throw new Error("Firebase messaging not initialized");
  }
  
  try {
    // First check notification permission
    console.log("Current permission status:", Notification.permission);
    
    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      console.log("Permission request result:", permission);
      
      if (permission !== "granted") {
        throw new Error("Notification permission not granted");
      }
    }
    
    console.log("Getting FCM token...");
    
    // Pass the VAPID key if you have one
    const currentToken = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    });
    
    if (currentToken) {
      console.log("FCM token obtained:", currentToken.substring(0, 10) + "...");
      return currentToken;
    } else {
      throw new Error("No registration token available");
    }
  } catch (error) {
    console.error("Error getting token:", error);
    throw error;
  }
};

// Handle foreground messages
export const onForegroundMessage = (callback) => {
  if (!messaging) return () => {};
  
  return onMessage(messaging, (payload) => {
    console.log("Received foreground message:", payload);
    callback(payload);
  });
};

export { app, messaging }; 