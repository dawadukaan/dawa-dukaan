// src/lib/api/authMiddleware.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { errorResponse } from "./apiResponse";
import jwt from "jsonwebtoken";

// You'll need to install jsonwebtoken
// npm install jsonwebtoken

// Secret key for JWT (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-for-development";

// Authenticate any logged-in user
export async function authenticateUser(request) {
  // Try NextAuth session first
  const session = await getServerSession(authOptions);
  
  if (session) {
    return {
      authenticated: true,
      response: null,
      session
    };
  }
  
  // If no NextAuth session, try JWT token
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      authenticated: false,
      response: errorResponse("Authentication required", 401),
      session: null
    };
  }
  
  const token = authHeader.split(" ")[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    return {
      authenticated: true,
      response: null,
      session: { user: decoded }
    };
  } catch (error) {
    return {
      authenticated: false,
      response: errorResponse("Invalid or expired token", 401),
      session: null
    };
  }
}

// Authenticate admin user
export async function authenticateAdmin(request) {
  // Try NextAuth session first
  const session = await getServerSession(authOptions);
  
  if (session) {
    if (session.user.role !== 'admin') {
      return {
        authenticated: false,
        response: errorResponse("Admin access required", 403),
        session
      };
    }
    
    return {
      authenticated: true,
      response: null,
      session
    };
  }
  
  // If no NextAuth session, try JWT token
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      authenticated: false,
      response: errorResponse("Authentication required", 401),
      session: null
    };
  }
  
  const token = authHeader.split(" ")[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.role !== 'admin') {
      return {
        authenticated: false,
        response: errorResponse("Admin access required", 403),
        session: { user: decoded }
      };
    }
    
    return {
      authenticated: true,
      response: null,
      session: { user: decoded }
    };
  } catch (error) {
    return {
      authenticated: false,
      response: errorResponse("Invalid or expired token", 401),
      session: null
    };
  }
}

// Authenticate vendor user
export async function authenticateVendor(request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return {
      authenticated: false,
      response: errorResponse("Authentication required", 401),
      session: null
    };
  }
  
  if (session.user.role !== 'vendor' && session.user.role !== 'admin') {
    return {
      authenticated: false,
      response: errorResponse("Vendor access required", 403),
      session
    };
  }
  
  return {
    authenticated: true,
    response: null,
    session
  };
}

export async function checkPermission(session, permission) {
  if (session.user.model !== 'AdminUser') {
    return false;
  }
  
  // For admin users, check specific permission
  return session.user.permissions && session.user.permissions[permission];
}