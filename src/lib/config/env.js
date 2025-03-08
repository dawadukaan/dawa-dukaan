// src/lib/config/env.js
const env = {
    // Database
    mongodb: {
      uri: process.env.MONGODB_URI,
    },
    
    // Authentication
    nextAuth: {
      url: process.env.NEXTAUTH_URL,
      secret: process.env.NEXTAUTH_SECRET,
    },
    
    // Application
    app: {
      name: process.env.NEXT_PUBLIC_APP_NAME,
      url: process.env.NEXT_PUBLIC_APP_URL,
      apiUrl: process.env.NEXT_PUBLIC_API_URL,
      isDev: process.env.NODE_ENV === 'development',
      isProd: process.env.NODE_ENV === 'production',
    },
    
    // File Upload
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
      url: process.env.CLOUDINARY_URL,
    },
    
    // Payment Gateway
    payment: {
      razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID,
        keySecret: process.env.RAZORPAY_KEY_SECRET,
      },
      phonepe: {
        merchantId: process.env.PHONEPE_MERCHANT_ID,
        saltKey: process.env.PHONEPE_SALT_KEY,
        saltIndex: process.env.PHONEPE_SALT_INDEX || '1',
      },
    },
    
    // Email Service
    email: {
      sendgridApiKey: process.env.SENDGRID_API_KEY,
      fromEmail: process.env.EMAIL_FROM,
    },
    
    // Admin Configuration
    admin: {
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    },
  };
  
  export default env;