// src/lib/config/constants.js
export const APP_CONSTANTS = {
    // Pagination
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 50,
    
    // Order Status
    ORDER_STATUS: {
      PROCESSING: 'Processing',
      PACKED: 'Packed',
      SHIPPED: 'Shipped',
      DELIVERED: 'Delivered',
      CANCELLED: 'Cancelled',
      RETURNED: 'Returned',
    },
    
    // User Roles
    USER_ROLES: {
      CUSTOMER: 'customer',
      ADMIN: 'admin',
      VENDOR: 'vendor',
      EDITOR: 'editor',
      DELIVERY: 'delivery',
    },
    
    // Payment Methods
    PAYMENT_METHODS: {
      COD: 'COD',
      PHONEPE: 'PhonePe',
      RAZORPAY: 'Razorpay',
    },
    
    // Delivery Slots
    DELIVERY_SLOTS: [
      { id: 'morning', label: 'Morning (8 AM - 12 PM)' },
      { id: 'afternoon', label: 'Afternoon (12 PM - 4 PM)' },
      { id: 'evening', label: 'Evening (4 PM - 8 PM)' },
    ],
    
    // Category Types
    CATEGORY_TYPES: [
      'Seasonal',
      'Exotic',
      'Leafy',
      'Root',
      'Combo',
    ],
    
    // Image Upload
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    
    // API Rate Limiting
    RATE_LIMIT: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
  };
  
  export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    DASHBOARD: '/dashboard',
    PRODUCTS: '/products',
    CATEGORIES: '/categories',
    CART: '/cart',
    CHECKOUT: '/checkout',
    ACCOUNT: '/account',
    ORDERS: '/orders',
    ADMIN: {
      DASHBOARD: '/dashboard',
      PRODUCTS: '/dashboard/products',
      CATEGORIES: '/dashboard/categories',
      ORDERS: '/dashboard/orders',
      CUSTOMERS: '/dashboard/customers',
      COUPONS: '/dashboard/coupons',
      ANALYTICS: '/dashboard/analytics',
      SETTINGS: '/dashboard/settings',
    },
  };
  
  export const API_ENDPOINTS = {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      RESET_PASSWORD: '/api/auth/reset-password',
    },
    USERS: '/api/users',
    PRODUCTS: '/api/products',
    CATEGORIES: '/api/categories',
    ORDERS: '/api/orders',
    COUPONS: '/api/coupons',
    REVIEWS: '/api/reviews',
    ADDRESSES: '/api/addresses',
    DASHBOARD: '/api/dashboard',
  };
  
  export const ERROR_MESSAGES = {
    GENERAL: 'Something went wrong. Please try again.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    VALIDATION: 'Please check your input and try again.',
    SERVER_ERROR: 'Server error. Please try again later.',
    DUPLICATE: 'This item already exists.',
    REQUIRED_FIELD: 'This field is required.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    INVALID_PASSWORD: 'Password must be at least 6 characters long.',
    PASSWORDS_DONT_MATCH: 'Passwords do not match.',
    INVALID_CREDENTIALS: 'Invalid email or password.',
    ACCOUNT_EXISTS: 'An account with this email already exists.',
    PRODUCT_OUT_OF_STOCK: 'This product is out of stock.',
    COUPON_INVALID: 'This coupon is invalid or has expired.',
    COUPON_MINIMUM_PURCHASE: 'Your order does not meet the minimum purchase requirement for this coupon.',
    PAYMENT_FAILED: 'Payment failed. Please try again.',
  };
  
  export const SUCCESS_MESSAGES = {
    ACCOUNT_CREATED: 'Your account has been created successfully.',
    LOGIN_SUCCESS: 'You have been logged in successfully.',
    PASSWORD_RESET: 'Your password has been reset successfully.',
    ORDER_PLACED: 'Your order has been placed successfully.',
    PRODUCT_ADDED: 'Product has been added to your cart.',
    REVIEW_SUBMITTED: 'Your review has been submitted successfully.',
    ADDRESS_ADDED: 'Address has been added successfully.',
    COUPON_APPLIED: 'Coupon has been applied successfully.',
  };