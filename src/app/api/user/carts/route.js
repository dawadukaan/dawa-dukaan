// src/app/api/user/carts/route.js
import dbConnect from "@/lib/db/connect";
import Cart from "@/lib/db/models/Cart";
import Product from "@/lib/db/models/Product";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import { authenticateUser } from "@/lib/api/authMiddleware";

// GET /api/user/carts - Get current user's cart
export async function GET(request) {
  try {
    await dbConnect();
    const { authenticated, response, session } = await authenticateUser(request);
    
    if (!authenticated) {
      return response;
    }
    
    const userId = session.user.id;
    
    // Find user's cart with populated product details
    let cart = await Cart.findOne({ user: userId }).populate({
      path: 'items.product',
      select: 'name price salePrice onSale images baseQuantity quantityUnit stock stockStatus'
    });
    
    // If no cart exists, create an empty one
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
        totalQuantity: 0,
        totalPrice: 0
      });
      await cart.save();
    }
    
    return successResponse(cart);
  } catch (error) {
    console.error("Error fetching cart:", error);
    return errorResponse("Failed to fetch cart", 500);
  }
}

// POST /api/user/carts - Add item to cart
export async function POST(request) {
  try {
    await dbConnect();
    const { authenticated, response, session } = await authenticateUser(request);
    
    if (!authenticated) {
      return response;
    }
    
    const userId = session.user.id;
    const { productId, quantity = 1 } = await request.json();
    
    if (!productId) {
      return errorResponse("Product ID is required", 400);
    }
    
    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return errorResponse("Product not found", 404);
    }
    
    // Check if product is in stock
    if (product.stock < quantity) {
      return errorResponse("Not enough stock available", 400);
    }
    
    // Find user's cart or create a new one
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
        totalQuantity: 0,
        totalPrice: 0
      });
    }
    
    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );
    
    if (existingItemIndex > -1) {
      // Update quantity if product already in cart
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cart.items.push({
        product: productId,
        quantity
      });
    }
    
    // Calculate cart totals with session
    await updateCartTotals(cart, session);
    
    // Return updated cart with populated product details
    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name price salePrice onSale images baseQuantity quantityUnit stock stockStatus prescriptionRequired'
    });
    
    return successResponse({
      message: "Item added to cart",
      cart: updatedCart
    });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    return errorResponse("Failed to add item to cart", 500);
  }
}

// PUT /api/user/carts - Update cart (update item quantity)
export async function PUT(request) {
  try {
    await dbConnect();
    const { authenticated, response, session } = await authenticateUser(request);
    
    if (!authenticated) {
      return response;
    }
    
    const userId = session.user.id;
    const { productId, quantity } = await request.json();
    
    if (!productId) {
      return errorResponse("Product ID is required", 400);
    }
    
    // Find user's cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return errorResponse("Cart not found", 404);
    }
    
    // Find the item in the cart
    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );
    
    if (itemIndex === -1) {
      return errorResponse("Item not found in cart", 404);
    }
    
    // If quantity is 0 or less, remove the item
    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      // Check if requested quantity is available in stock
      const product = await Product.findById(productId);
      if (!product) {
        return errorResponse("Product not found", 404);
      }
      
      if (product.stock < quantity) {
        return errorResponse("Not enough stock available", 400);
      }
      
      // Update the quantity
      cart.items[itemIndex].quantity = quantity;
    }
    
    // Calculate cart totals with session
    await updateCartTotals(cart, session);
    
    // Return updated cart with populated product details
    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name price salePrice onSale images baseQuantity quantityUnit stock stockStatus'
    });
    
    return successResponse({
      message: quantity <= 0 ? "Item removed from cart" : "Cart updated",
      cart: updatedCart
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    return errorResponse("Failed to update cart", 500);
  }
}

// DELETE /api/user/carts - Clear cart or remove specific item
export async function DELETE(request) {
  try {
    await dbConnect();
    const { authenticated, response, session } = await authenticateUser(request);
    
    if (!authenticated) {
      return response;
    }
    
    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    
    // Find user's cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return errorResponse("Cart not found", 404);
    }
    
    if (productId) {
      // Remove specific item
      const itemIndex = cart.items.findIndex(
        item => item.product.toString() === productId
      );
      
      if (itemIndex === -1) {
        return errorResponse("Item not found in cart", 404);
      }
      
      cart.items.splice(itemIndex, 1);
    } else {
      // Clear entire cart
      cart.items = [];
    }
    
    // Calculate cart totals with session
    await updateCartTotals(cart, session);
    
    return successResponse({
      message: productId ? "Item removed from cart" : "Cart cleared",
      cart
    });
  } catch (error) {
    console.error("Error deleting from cart:", error);
    return errorResponse("Failed to delete from cart", 500);
  }
}

// Helper function to update cart totals
async function updateCartTotals(cart, session) {
  // Determine if user is licensed
  const isLicensed = session?.user?.type === 'licensee';
  
  // Calculate total quantity
  cart.totalQuantity = cart.items.reduce((total, item) => total + item.quantity, 0);
  
  // Calculate total price
  if (cart.items.length > 0) {
    // Fetch all products to calculate accurate prices
    const productIds = cart.items.map(item => item.product);
    const products = await Product.find({ _id: { $in: productIds } });
    
    cart.totalPrice = cart.items.reduce((total, item) => {
      const product = products.find(p => p._id.toString() === item.product.toString());
      if (!product) return total;
      
      let itemPrice;
      if (product.onSale && product.salePrice) {
        // Use sale price based on user type
        itemPrice = isLicensed 
          ? product.salePrice.licensedPrice 
          : product.salePrice.unlicensedPrice;
      } else {
        // Use regular price based on user type
        itemPrice = isLicensed 
          ? product.price.licensedPrice 
          : product.price.unlicensedPrice;
      }
      
      return total + (itemPrice * item.quantity);
    }, 0);
  } else {
    cart.totalPrice = 0;
  }
  
  await cart.save();
  return cart;
}
