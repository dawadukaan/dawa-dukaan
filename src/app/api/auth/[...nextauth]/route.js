// src/app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import AdminUser from '@/lib/db/models/AdminUser';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        await dbConnect();
        
        // Check if user is an admin
        const adminUser = await AdminUser.findOne({ email: credentials.email });
        if (adminUser) {
          const isValid = await bcrypt.compare(credentials.password, adminUser.password);
          if (isValid) {
            return {
              id: adminUser._id.toString(),
              name: adminUser.name,
              email: adminUser.email,
              role: 'admin'
            };
          }
        }
        
        // Check if user is a regular user
        const user = await User.findOne({ email: credentials.email });
        if (user) {
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (isValid) {
            return {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              role: user.role || 'customer' // Default to customer if no role
            };
          }
        }
        
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  session: {
    strategy: 'jwt',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };