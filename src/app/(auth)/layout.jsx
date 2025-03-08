import Image from 'next/image';
import Link from 'next/link';
import { Toaster } from 'react-hot-toast';

export default function AuthLayout({ children }) {
  return (
    <div className='min-h-screen flex flex-col md:flex-row relative'>
      {/* Background image */}
      <div className='absolute inset-0'>
        <Image 
          src="/images/vegetables-hero.jpg" 
          alt="vegetables" 
          fill
          className='object-cover'
          priority
        />
      </div>

      {/* Left side - Image with overlay */}
      <div className='relative w-full md:w-1/2 min-h-screen'>
        <div className='absolute inset-0 bg-black/60' />
        <div className='relative z-10 flex flex-col items-center justify-center h-full p-8'>
          <h1 className='text-white text-4xl font-bold text-center mb-4'>
            Welcome to  DavaDukaan
          </h1>
          <p className='text-white/90 text-lg text-center'>
            Login or Register to continue
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className='relative w-full md:w-1/2 min-h-screen bg-black/50'>
        <div className='flex flex-col items-center justify-center h-full p-8'>
          <div className='w-full max-w-md'>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}