// src/lib/db/models/Product.js
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters'],
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  baseQuantity: {
    type: String,
    required: [true, 'Please provide a base quantity'],
    trim: true,
  },
  quantityUnit: {
    type: String,
    enum: ['pcs', 'pc', 'tab', 'cap', 'strip', 'bottle', 'box', 'vial', 'ampule', 'phile', 'tube', 'jar', 'piece', 'packet', 'tabs', 'caps', 'strips', 'bottles', 'boxes', 'vials', 'ampules', 'philes', 'tubes', 'jars', 'pieces', 'packets'],
    required: [true, 'Please provide a quantity unit'],
    trim: true,
  },
  price: {
    licensedPrice: {
      type: Number,
      required: [true, 'Please provide a price for licensed users'],
      min: [0, 'Price cannot be negative'],
    },
    unlicensedPrice: {
      type: Number,
      required: [true, 'Please provide a price for unlicensed users'],
      min: [0, 'Price cannot be negative'],
    }
  },
  salePrice: {
    licensedPrice: {
      type: Number,
      min: [0, 'Sale price cannot be negative'],
    },
    unlicensedPrice: {
      type: Number,
      min: [0, 'Sale price cannot be negative'],
    }
  },
  discountPercentage: {
    licensedDiscount: {
      type: Number,
      min: [0, 'Discount percentage cannot be negative'],
      max: [100, 'Discount percentage cannot exceed 100'],
    },
    unlicensedDiscount: {
      type: Number,
      min: [0, 'Discount percentage cannot be negative'],
      max: [100, 'Discount percentage cannot exceed 100'],
    }
  },
  sku: {
    type: String,
    required: [true, 'Please provide a SKU'],
    trim: true,
  },
  stock: {
    type: Number,
    required: [true, 'Please provide stock information'],
    min: [0, 'Stock cannot be negative'],
    default: 0,
  },
  stockUnit: {
    type: String,
    enum: ['pcs', 'pc', 'tab', 'cap', 'strip', 'bottle', 'box', 'vial', 'ampule', 'phile', 'tube', 'jar', 'piece', 'packet', 'tabs', 'caps', 'strips', 'bottles', 'boxes', 'vials', 'ampules', 'philes', 'tubes', 'jars', 'pieces', 'packets'],
    required: [true, 'Please provide a stock unit'],
    trim: true,
  },
  stockStatus: {
    type: String,
    enum: ['in stock', 'out of stock', 'low stock'],
    required: [true, 'Please provide stock status'],
    trim: true,
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  }],
  primaryCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please provide a primary category'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true,
  },
  shortDescription: {
    type: String,
    trim: true,
  },
  onSale: {
    type: Boolean,
    default: false,
  },
  images: [{
    type: String,
  }],
  medicineDetails: {
    compositions: [{
      type: String,
    }],
    manufacturer: {
      type: String,
      required: [true, 'Please provide a manufacturer'],
    }
  },
  additionalInfo: {
    type: Map,
    of: String,
  },
  prescriptionRequired: {
    type: Boolean,
    default: false,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  publishStatus: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
  },
  publishDate: {
    type: Date,
  },
  publishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create slug from name if not provided
ProductSchema.pre('save', function(next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  // Calculate discount percentage if not provided
  if (this.price && this.salePrice) {
    // Calculate for licensed users
    if (this.price.licensedPrice && this.salePrice.licensedPrice && !this.discountPercentage?.licensedDiscount) {
      this.discountPercentage = {
        ...this.discountPercentage,
        licensedDiscount: Math.round(
          ((this.price.licensedPrice - this.salePrice.licensedPrice) / this.price.licensedPrice) * 100
        )
      };
    }
    
    // Calculate for unlicensed users
    if (this.price.unlicensedPrice && this.salePrice.unlicensedPrice && !this.discountPercentage?.unlicensedDiscount) {
      this.discountPercentage = {
        ...this.discountPercentage,
        unlicensedDiscount: Math.round(
          ((this.price.unlicensedPrice - this.salePrice.unlicensedPrice) / this.price.unlicensedPrice) * 100
        )
      };
    }
  }
  
  // Set publishDate when status changes to published
  if (this.isModified('publishStatus') && this.publishStatus === 'published' && !this.publishDate) {
    this.publishDate = new Date();
  }
  
  this.updatedAt = Date.now();
  next();
});

// Create text index for search
ProductSchema.index({ 
  name: 'text', 
  description: 'text', 
  shortDescription: 'text',
  'medicineDetails.genericName': 'text',
  'medicineDetails.composition': 'text'
});

// Use this pattern to prevent model recompilation errors
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
export default Product;