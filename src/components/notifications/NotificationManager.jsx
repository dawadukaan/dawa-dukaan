'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { requestNotificationPermission, onMessageListener } from '@/lib/firebase/clientApp';
import { toast } from 'react-hot-toast';

export default function NotificationManager() {
  const { data: session, status } = useSession();
  const [notification, setNotification] = useState(null);
  
  useEffect(() => {
    // Only proceed if the session is authenticated
    if (status !== 'authenticated' || !session?.user) return;
    
    // Request permission and register token
    const registerToken = async () => {
      try {
        const token = await requestNotificationPermission();
        
        if (token) {
          // Get device info
          const device = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
          };
          
          // Register token with backend
          const response = await fetch('/api/notifications/register-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              token,
              device: JSON.stringify(device),
            }),
          });
          
          const data = await response.json();
          
          if (!data.success) {
            console.error('Failed to register FCM token:', data.message);
          }
        }
      } catch (error) {
        console.error('Error registering notification token:', error);
      }
    };
    
    registerToken();
    
    // Listen for foreground messages
    const unsubscribe = onMessageListener().then(payload => {
      setNotification({
        title: payload?.notification?.title,
        body: payload?.notification?.body,
        data: payload?.data,
      });
      
      // Show toast notification
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">{payload?.notification?.title}</p>
                <p className="mt-1 text-sm text-gray-500">{payload?.notification?.body}</p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Close
            </button>
          </div>
        </div>
      ));
    });
    
    return () => {
      unsubscribe.catch(err => console.error(err));
    };
  }, [session, status]);
  
  return null; // This component doesn't render anything
}