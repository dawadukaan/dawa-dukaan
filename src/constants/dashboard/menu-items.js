import { 
  FiHome, 
  FiShoppingBag, 
  FiShoppingCart, 
  FiUsers, 
  FiBarChart2, 
  FiBox, 
  FiSettings,
  FiTag,
  FiTruck,
  FiCreditCard,
  FiMessageSquare,
  FiPlus,
  FiList,
  FiCloud,
  FiDatabase,
  FiBell,
  FiDollarSign,
  FiHelpCircle,
  FiLogOut,
  FiFileText,
  FiDownload,
  FiImage
} from 'react-icons/fi';

export const MENU_ITEMS = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: FiHome,
    description: 'Overview of your store performance'
  },
  {
    label: 'Notifications',
    path: '/dashboard/notifications',
    icon: FiBell,
    description: 'Manage your notifications'
  },
  // {
  //   label: 'Slider Images',
  //   path: '/dashboard/slider-images',
  //   icon: FiImage,
  //   description: 'Manage your slider images'
  // },
  {
    label: 'Products',
    path: '/dashboard/products',
    icon: FiShoppingBag,
    description: 'Manage your product inventory',
    subItems: [
      {
        label: 'All Products',
        path: '/dashboard/products',
        icon: FiList
      },
      {
        label: 'Add Product',
        path: '/dashboard/products/add',
        icon: FiPlus
      }
    ]
  },
  {
    label: 'Categories',
    path: '/dashboard/categories',
    icon: FiTag,
    description: 'Organize your product categories',
    subItems: [
      {
        label: 'All Categories',
        path: '/dashboard/categories',
        icon: FiList
      },
      {
        label: 'Add Category',
        path: '/dashboard/categories/add',
        icon: FiPlus
      }
    ]
  },
  {
    label: 'Orders',
    path: '/dashboard/orders',
    icon: FiShoppingCart,
    description: 'View and manage customer orders',
    subItems: [
      {
        label: 'All Orders',
        path: '/dashboard/orders',
        icon: FiList
      },
      {
        label: 'Add Order',
        path: '/dashboard/orders/add',
        icon: FiPlus
      }
    ]
  },
  {
    label: 'Customers',
    path: '/dashboard/customers',
    icon: FiUsers,
    description: 'Manage your customer database',
    subItems: [
      {
        label: 'All Customers',
        path: '/dashboard/customers',
        icon: FiList
      },
      {
        label: 'Add Customer',
        path: '/dashboard/customers/add',
        icon: FiPlus
      }
    ]
  },
  {
    label: 'Referrals',
    path: '/dashboard/referrals',
    icon: FiUsers,
    description: 'Manage your referral program'
  },
  // {
  //   label: 'Payments',
  //   path: '/dashboard/payments',
  //   icon: FiCreditCard,
  //   description: 'View payment transactions'
  // },
  {
    label: 'App Updates',
    path: '/dashboard/app-updates',
    icon: FiDownload,
    description: 'Manage your app updates'
  },
  {
    label: 'Settings',
    path: '/dashboard/settings',
    icon: FiSettings,
    description: 'Configure your store settings',
    subItems: [
      { 
        label: 'Cloudinary',
        path: '/dashboard/settings/cloudinary',
        icon: FiCloud
      },
      {
        label: 'Firebase',
        path: '/dashboard/settings/firebase',
        icon: FiDatabase
      },
      {
        label: 'Firebase Admin',
        path: '/dashboard/settings/firebase-admin',
        icon: FiDatabase
      },
      {
        label: 'PhonePe',
        path: '/dashboard/settings/phonepe',
        icon: FiCreditCard
      }
    ]
  }
];

export default MENU_ITEMS;