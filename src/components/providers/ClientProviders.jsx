'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import NotificationManager from "@/components/notifications/NotificationManager";

export default function ClientProviders({ children }) {
  return (
    <SessionProvider>
      {children}
      <Toaster position="top-right" />
      <NotificationManager />
    </SessionProvider>
  );
} 