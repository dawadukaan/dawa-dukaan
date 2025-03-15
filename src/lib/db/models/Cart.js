// src/lib/db/models/Cart.js
import mongoose from 'mongoose';

const CartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'],
      },
    },
  ],
  totalQuantity: {
    type: Number,
    required: true,
    min: [0, 'Total quantity cannot be negative'],
  },
  totalPrice: {
    type: Number,
    required: true,
    min: [0, 'Total price cannot be negative'],
  },
});

// Indexes for better query performance
CartSchema.index({ user: 1 });

// Ensure virtuals are included in JSON output
CartSchema.set('toJSON', { virtuals: true });
CartSchema.set('toObject', { virtuals: true });

const Cart = mongoose.models.Cart || mongoose.model('Cart', CartSchema);

export default Cart;


