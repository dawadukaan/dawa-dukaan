# Dawa Dukaan - Medical Store Management Portal & Mobile App

## Project Overview

Dawa Dukaan is a comprehensive medical store management system that includes both a web portal for administrators and a mobile application for customers. The platform streamlines the process of managing and showcasing medical products while offering different pricing tiers for licensed (medical professionals) and unlicensed (general public) users. The system includes a referral program and a call-to-buy feature, ensuring ease of purchase without requiring an integrated payment gateway.

## Core Features

### 1. Product Management
- **Medicine Details:**
  - Name and generic name
  - Batch number and expiry date
  - Manufacturer information
  - Composition and dosage information
  - Regular price
  - Special price for licensed users
  - Detailed & short description
  - Usage instructions and side effects
  - Multiple product images
  - Prescription requirement indicator
  - On Product list page admin can edit directly current price without opening product

### 2. Category Management
- Create, edit, delete categories
- Featured categories on homepage
- Examples: Antibiotics, Pain Relief, Vitamins, Supplements, Ayurvedic, etc.

### 3. User & Role Management
- **User Types:**
  - Customers (Unlicensed Users)
  - Licensed Users (Doctors, Pharmacists, Medical Professionals)
  - Administrators
- Role-based permissions and pricing
- User profile & address book

### 4. Mobile App Features
- User authentication with role-based access
- Product browsing with search functionality
- Call-to-buy feature
- Referral program interface
- Add to list (similar to cart) functionality
- User profile management

### 5. Dashboard & Analytics
- Sales overview & graphs
- User registration metrics
- Popular products
- Referral program statistics

## Additional Features

### 6. Order Management
- Manual order tracking & history
- Status updates (processing, packed, delivered)
- Invoice generation

### 7. Referral System
- Referral link generation
- Manual referral tracking via Excel upload
- Referral earnings display for users

### 8. Customer Experience
- Search by composition and medicine name
- Recently viewed products
- Favorites list

### 9. Mobile Responsiveness
- Fully responsive admin portal
- Native mobile app for Android and iOS

### 10. Compliance
- Privacy policy page
- Terms of service
- Delete account functionality
- Contact information

## Project Structure

```
src/
├── app/                      
│   ├── (auth)/               
│   │   ├── admin/            # Admin authentication
│   │   │   ├── login/        # Admin login page
│   │   │   ├── forgot-password/ # Admin password recovery
│   │   │   └── layout.js     # Admin auth layout
│   │
│   ├── (dashboard)/          
│   │   ├── dashboard/        # Admin dashboard
│   │   │   ├── page.js       # Dashboard home/overview
│   │   │   ├── products/     # Product management
│   │   │   │   ├── page.js   # Product listing
│   │   │   │   ├── add/      # Add new product
│   │   │   │   ├── [id]/     # Edit product
│   │   │   │   └── categories/ # Product categories
│   │   │   │
│   │   │   ├── customers/    # Customer management
│   │   │   │   ├── page.js   # Customer listing
│   │   │   │   ├── [id]/     # Customer details
│   │   │   │   └── export/   # Export customer data
│   │   │   │
│   │   │   ├── referrals/    # Referral management
│   │   │   │   ├── page.js   # Referral overview
│   │   │   │   ├── import/   # Import referrals from Excel
│   │   │   │   └── reports/  # Referral reports
│   │   │   │
│   │   │   ├── analytics/    # Analytics and reports
│   │   │   │   ├── page.js   # Main analytics
│   │   │   │   ├── users/    # User analytics
│   │   │   │   └── products/ # Product analytics
│   │   │   │
│   │   │   └── settings/     # System settings
│   │   │       ├── page.js   # General settings
│   │   │       ├── profile/  # Admin profile
│   │   │       └── app/      # App settings
│   │   │
│   │   └── layout.js         # Dashboard layout
│   │
│   ├── (shop)/               # Main shop routes (grouped)
│   │   ├── products/         # Product listing
│   │   │   └── [slug]/       # Product detail page
│   │   ├── categories/       # Category listing
│   │   │   └── [slug]/       # Category detail page
│   │   ├── list/             # User's saved list
│   │   ├── account/          # User account pages
│   │   │   ├── profile/      # User profile
│   │   │   ├── referrals/    # Referral tracking
│   │   │   ├── addresses/    # Address management
│   │   │   └── favorites/    # Favorites list
│   │   └── layout.js         # Shop layout
│   │
│   ├── api/                  # API routes
│   │   ├── auth/             # Authentication endpoints
│   │   ├── products/         # Product endpoints
│   │   ├── categories/       # Category endpoints
│   │   ├── users/            # User endpoints
│   │   ├── referrals/        # Referral endpoints
│   │   └── ...
│   │
│   ├── globals.css           # Global styles
│   ├── layout.js             # Root layout
│   └── page.js               # Homepage
│
├── components/               # Reusable components
│   ├── ui/                   # UI components
│   ├── layout/               # Layout components
│   ├── shop/                 # Shop-specific components
│   └── dashboard/            # Dashboard-specific components
│
├── lib/                      # Utility libraries and functions
│   ├── db/                   # Database utilities
│   │   ├── models/           # Mongoose models
│   │   ├── schema/           # Database schemas
│   │   └── connect.js        # Database connection
│   │
│   ├── auth/                 # Authentication utilities
│   ├── api/                  # API utilities
│   ├── utils/                # Utility functions
│   └── constants/            # Constants and enums
│
├── hooks/                    # Custom React hooks
├── context/                  # React context providers
├── styles/                   # Styles
└── types/                    # TypeScript type definitions
```

## Mobile App Structure

The mobile app will be developed using Flutter for cross-platform compatibility:

```
lib/
├── main.dart                 # App entry point
├── config/                   # App configuration
│   ├── routes.dart           # Route definitions
│   ├── theme.dart            # App theme
│   └── constants.dart        # App constants
│
├── models/                   # Data models
│   ├── product.dart          # Product model
│   ├── user.dart             # User model
│   ├── category.dart         # Category model
│   └── referral.dart         # Referral model
│
├── screens/                  # App screens
│   ├── auth/                 # Authentication screens
│   │   ├── login_screen.dart
│   │   └── register_screen.dart
│   │
│   ├── home/                 # Home screen
│   │   └── home_screen.dart
│   │
│   ├── products/             # Product screens
│   │   ├── product_list.dart
│   │   └── product_detail.dart
│   │
│   ├── account/              # Account screens
│   │   ├── profile_screen.dart
│   │   ├── referrals_screen.dart
│   │   └── addresses_screen.dart
│   │
│   └── other/                # Other screens
│       ├── about_screen.dart
│       ├── privacy_policy.dart
│       └── contact_screen.dart
│
├── widgets/                  # Reusable widgets
│   ├── product_card.dart
│   ├── category_card.dart
│   ├── custom_button.dart
│   └── ...
│
├── services/                 # API services
│   ├── api_service.dart      # Base API service
│   ├── auth_service.dart     # Authentication service
│   ├── product_service.dart  # Product service
│   └── ...
│
└── utils/                    # Utility functions
    ├── validators.dart
    ├── formatters.dart
    └── helpers.dart
```

## Tech Stack

### Web Portal
- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB
- **Authentication**: JWT-based authentication
- **Deployment**: Vercel

### Mobile App
- **Framework**: Flutter
- **Backend Integration**: RESTful API
- **Authentication**: Firebase Authentication
- **Analytics**: Firebase Analytics
- **Crash Reporting**: Firebase Crashlytics
- **Push Notifications**: Firebase Cloud Messaging (FCM)

## Development Timeline

### Phase 1: Planning & Setup (Week 1)
- Project setup and configuration
- Database models and connections
- Authentication system design
- UI/UX wireframing

### Phase 2: Admin Portal Development (Week 2)
- Admin dashboard layout
- Product and category management
- User management
- Referral system setup

### Phase 3: Mobile App Development (Week 3)
- User authentication
- Product browsing and search
- Call-to-buy functionality
- User profile and list management

### Phase 4: Testing & Deployment (Week 4)
- Integration testing
- Bug fixes and optimizations
- App store submission
- Portal deployment

## Budget Breakdown

| Category | Cost (INR) |
|----------|------------|
| Design & Development | ₹40,000 |
| Post-Deployment Support (6 months) | ₹10,000 |
| **Total** | **₹50,000** |

## Payment Terms
- 20% Advance Payment (Project Initiation)
- 50% After Completion of Frontend & Backend Development
- 30% After Final Deployment & Acceptance

## Contact Information
- **Prepared by**: Shivam Kumar
- **Email**: shivam@wizzyweb.com
- **Company**: WizzyWeb Private Limited

# Dawa Dukaanproject
# Dawa Dukaanproject
