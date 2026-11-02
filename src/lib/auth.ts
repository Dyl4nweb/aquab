import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        pin: { label: 'PIN', type: 'password' },
      },
      async authorize(credentials) {
        // 1. PIN-based Instant Login
        if (credentials?.pin && credentials.pin.trim()) {
          const pin = credentials.pin.trim();
          const users: any[] = await prisma.$queryRawUnsafe(
            'SELECT id, name, email, role, phone, "isActive" FROM "User" WHERE pin = $1 LIMIT 1',
            pin
          );

          if (!users || users.length === 0) {
            throw new Error('Maling PIN. Pakisubukang muli.');
          }

          const user = users[0];
          if (!user.isActive) {
            throw new Error('Naka-deactivate ang account na ito. Kontakin ang Super Admin.');
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone || '',
          };
        }

        // 2. Email + Password Login
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Ilagay ang iyong 4-digit PIN o email at password.');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!user) {
          throw new Error('Walang account na natagpuan sa email na ito.');
        }

        if (!user.isActive) {
          throw new Error('Naka-deactivate ang account na ito. Kontakin ang Super Admin.');
        }

        const isPasswordMatch = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordMatch) {
          throw new Error('Maling password.');
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone || '',
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.phone = (user as any).phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).phone = token.phone;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'aqua-b-fallback-secret-2026',
};

