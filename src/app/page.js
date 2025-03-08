// src/app/page.js

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Hero section animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Navigation Header */}
      <header className="fixed w-full top-0 z-50 bg-gradient-to-r from-green-900/90 to-green-800/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src="/images/logo.jpg"
                  alt="DavaDukaan Logo"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <span className="ml-2 text-xl font-bold text-white">DavaDukaan</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/shop" className="text-white hover:text-green-300 px-3 py-2 text-sm font-medium">
                Shop
              </Link>
              <Link href="/about" className="text-white hover:text-green-300 px-3 py-2 text-sm font-medium">
                About
              </Link>
              <Link href="/contact" className="text-white hover:text-green-300 px-3 py-2 text-sm font-medium">
                Contact
              </Link>
              
              {/* App Download Button */}
              <a 
                href="#" 
                className="text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center"
                onClick={(e) => {
                  e.preventDefault();
                  // App download logic would go here
                  alert('App download coming soon!');
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Get App
              </a>
              
              {/* Login Button */}
              <Link 
                href="/login" 
                className="text-white hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-medium"
              >
                Login
              </Link>
              
              {/* Register Button */}
              <Link 
                href="/register" 
                className="text-green-900 bg-white hover:bg-green-50 px-4 py-2 rounded-lg text-sm font-medium"
              >
                Register
              </Link>
              
              {/* Admin Login Link */}
              <Link 
                href="/admin/login" 
                className="text-white/70 hover:text-white text-xs underline"
              >
                Admin
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white hover:text-green-300 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 space-y-2 border-t border-white/10">
              <Link href="/shop" className="block text-white hover:bg-green-800 px-4 py-2 rounded-lg">
                Shop
              </Link>
              <Link href="/about" className="block text-white hover:bg-green-800 px-4 py-2 rounded-lg">
                About
              </Link>
              <Link href="/contact" className="block text-white hover:bg-green-800 px-4 py-2 rounded-lg">
                Contact
              </Link>
              
              <div className="pt-2 border-t border-white/10 mt-2 grid grid-cols-2 gap-2">
                <Link href="/login" className="text-center text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg">
                  Login
                </Link>
                <Link href="/register" className="text-center text-green-900 bg-white hover:bg-green-50 px-4 py-2 rounded-lg">
                  Register
                </Link>
              </div>
              
              <a 
                href="#" 
                className="block text-center text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
                onClick={(e) => {
                  e.preventDefault();
                  alert('App download coming soon!');
                }}
              >
                <span className="flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Get App
                </span>
              </a>
              
              <Link href="/admin/login" className="block text-center text-white/70 hover:text-white text-xs pt-2">
                Admin Login
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - Add padding-top to account for fixed header */}
      <section className="relative h-[90vh] flex items-center pt-16 md:pt-20">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/vegetables-hero.jpg" 
            alt="Fresh vegetables" 
            fill
            className="object-cover brightness-[0.7]"
            priority
          />
        </div>
        
        {/* Hero Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="max-w-3xl"
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
            variants={fadeIn}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Fresh Vegetables <span className="text-green-400">Delivered</span> To Your Doorstep
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Shop for the freshest vegetables from local farmers and get them delivered right to your home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/shop" className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg text-center transition-colors">
                Shop Now
              </Link>
              <Link href="/register" className="px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-medium rounded-lg text-center transition-colors">
                Create Account
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose DavaDukaan?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We connect you directly with local farmers to bring you the freshest produce while supporting local agriculture.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Farm Fresh Quality</h3>
              <p className="text-gray-600">
                All our vegetables are sourced directly from farms, ensuring maximum freshness and quality.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Fast Delivery</h3>
              <p className="text-gray-600">
                Get your vegetables delivered within 24 hours of ordering, right to your doorstep.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Support Local Farmers</h3>
              <p className="text-gray-600">
                By shopping with us, you directly support local farmers and sustainable agriculture.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Products Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Popular Products</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our most popular fresh vegetables and seasonal offerings.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Product cards would go here - showing 4 examples */}
            {[
              { name: 'Fresh Tomatoes', price: '₹60/kg', image: '/images/tomatoes.jpg' },
              { name: 'Organic Spinach', price: '₹40/bunch', image: '/images/spinach.jpg' },
              { name: 'Red Onions', price: '₹35/kg', image: '/images/onions.jpg' },
              { name: 'Green Peppers', price: '₹80/kg', image: '/images/peppers.jpg' }
            ].map((product, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="h-48 relative">
                  <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                  {/* Uncomment when you have actual images */}
                  {/* <Image 
                    src={product.image} 
                    alt={product.name} 
                    fill
                    className="object-cover"
                  /> */}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-green-600 font-medium mb-4">{product.price}</p>
                  <button className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/shop" className="inline-block px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Getting fresh vegetables delivered is easy with DavaDukaan.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-green-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Create an Account</h3>
              <p className="text-gray-600">
                Sign up for free and set up your delivery preferences and address.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Select Your Vegetables</h3>
              <p className="text-gray-600">
                Browse our wide selection of fresh vegetables and add them to your cart.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Get Fresh Delivery</h3>
              <p className="text-gray-600">
                We'll deliver your order right to your doorstep within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Don't just take our word for it - hear from our satisfied customers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Priya Sharma</h4>
                  <p className="text-gray-500 text-sm">Delhi</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "The vegetables from DavaDukaan are always fresh and of excellent quality. The delivery is prompt and the prices are reasonable. Highly recommended!"
              </p>
              <div className="flex mt-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Rahul Verma</h4>
                  <p className="text-gray-500 text-sm">Mumbai</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "I've been using DavaDukaan for 3 months now and I'm very impressed with their service. The vegetables are always fresh and the app is very easy to use."
              </p>
              <div className="flex mt-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Anita Patel</h4>
                  <p className="text-gray-500 text-sm">Bangalore</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "What I love most about DavaDukaan is that they support local farmers. The vegetables are always fresh and I feel good knowing I'm supporting the local economy."
              </p>
              <div className="flex mt-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Add App Download Section before the CTA */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Get Our Mobile App</h2>
              <p className="text-xl text-gray-300 mb-8 max-w-lg">
                Download the DavaDukaan app for a better shopping experience. Order vegetables, track deliveries, and get exclusive offers.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#" className="flex items-center justify-center bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg border border-gray-700">
                  <svg className="w-8 h-8 mr-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.5,12.5c0-0.9,0.5-1.7,1.3-2.2c-0.5-0.7-1.2-1.3-2.1-1.6c-0.9-0.3-1.7-0.4-2.5-0.4c-1.1,0-2.2,0.3-3.1,0.9c-0.9,0.6-1.6,1.4-2,2.4c-0.4,1-0.5,2.1-0.3,3.1c0.2,1,0.7,2,1.4,2.7c0.7,0.7,1.6,1.2,2.6,1.4c1,0.2,2.1,0.1,3.1-0.3c1-0.4,1.8-1.1,2.4-2C17.2,14.7,17.5,13.6,17.5,12.5z M21,12.5c0,1.3-0.3,2.6-0.9,3.8c-0.6,1.2-1.4,2.2-2.4,3c-1,0.8-2.2,1.4-3.4,1.8c-1.3,0.4-2.6,0.5-3.9,0.3c-1.3-0.2-2.5-0.7-3.5-1.5c-1.1-0.8-1.9-1.8-2.5-3c-0.6-1.2-0.9-2.5-0.9-3.8c0-1.3,0.3-2.6,0.9-3.8c0.6-1.2,1.4-2.2,2.5-3c1.1-0.8,2.3-1.3,3.5-1.5c1.3-0.2,2.6-0.1,3.9,0.3c1.2,0.4,2.4,1,3.4,1.8c1,0.8,1.8,1.8,2.4,3C20.7,9.9,21,11.2,21,12.5z"></path>
                  </svg>
                  <div>
                    <div className="text-xs">Download on the</div>
                    <div className="text-lg font-semibold">App Store</div>
                  </div>
                </a>
                
                <a href="#" className="flex items-center justify-center bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg border border-gray-700">
                  <svg className="w-8 h-8 mr-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.5,20.5c0.2,0.3,0.5,0.5,0.8,0.5h0.2c0.2,0,0.4-0.1,0.6-0.2l7.4-4.3l-3-3L3.5,20.5z M14.7,16.5l7.4,4.3c0.2,0.1,0.4,0.2,0.6,0.2h0.2c0.3,0,0.6-0.2,0.8-0.5l-6-7L14.7,16.5z M21.5,8.2c-0.3-0.3-0.7-0.4-1.1-0.3l-16,5.8C4,13.8,3.8,14.2,3.8,14.6c0,0.4,0.2,0.8,0.6,1l3.7,2.1l9.9-5.7L12.3,6.3L21.5,8.2z"></path>
                  </svg>
                  <div>
                    <div className="text-xs">GET IT ON</div>
                    <div className="text-lg font-semibold">Google Play</div>
                  </div>
                </a>
              </div>
            </div>
            
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-64 h-96">
                <div className="absolute inset-0 bg-gradient-to-b from-green-500 to-green-700 rounded-3xl transform rotate-3"></div>
                <div className="absolute inset-0 bg-white rounded-3xl shadow-xl overflow-hidden">
                  <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-500 text-center px-4">App Screenshot<br />Coming Soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Join thousands of satisfied customers who get fresh vegetables delivered to their doorstep every day.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="px-8 py-4 bg-white text-green-600 font-medium rounded-lg hover:bg-gray-100 transition-colors">
              Create Account
            </Link>
            <Link href="/shop" className="px-8 py-4 bg-green-700 text-white font-medium rounded-lg hover:bg-green-800 transition-colors">
              Shop Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

