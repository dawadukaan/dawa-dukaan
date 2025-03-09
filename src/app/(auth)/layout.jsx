import Image from 'next/image';
import Link from 'next/link';
import { Toaster } from 'react-hot-toast';

export default function AuthLayout({ children }) {
  return (
    <div className='min-h-screen flex flex-col md:flex-row relative'>
      {/* Background image - visible on all devices */}
      <div className='absolute inset-0'>
        <Image 
          src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=2030&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
          alt="Medical supplies and medicines" 
          fill
          className='object-cover'
          priority
        />
      </div>

      {/* Left side - Image with overlay (hidden on mobile) */}
      <div className='hidden md:block relative w-full md:w-1/2 min-h-screen'>
        <div className='absolute inset-0 bg-blue-900/70' />
        <div className='relative z-10 flex flex-col items-center justify-center h-full p-8'>
          <h1 className='text-white text-4xl font-bold text-center mb-4'>
            Welcome to DavaDukaan
          </h1>
          <p className='text-white/90 text-lg text-center'>
            Your trusted medical store for quality medicines
          </p>
        </div>
      </div>

      {/* Right side - Form (full width on mobile) */}
      <div className='relative w-full min-h-screen bg-black/50'>
        <div className='flex flex-col items-center justify-center h-full p-4 sm:p-8'>
          {/* Mobile-only header */}
          <div className='md:hidden text-center mb-6'>
            <h1 className='text-white text-3xl font-bold mb-2'>
              Welcome to DavaDukaan
            </h1>
            <p className='text-white/90 text-base'>
              Your trusted medical store
            </p>
          </div>
          
          <div className='w-full max-w-md'>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}