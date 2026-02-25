import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from './db';
import type { SessionUser } from './types';

declare module 'next-auth' {
  interface Session {
    user: SessionUser;
  }
  interface User extends SessionUser {}
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            company: {
              select: {
                id: true,
                name: true,
                memberId: true,
                canUseReferrerPortal: true,
                canUseProviderPortal: true,
                isSuspended: true,
              },
            },
          },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await compare(password, user.passwordHash);

        if (!isPasswordValid) {
          return null;
        }

        // Check if company is suspended (unless SUPERADMIN)
        if (user.company.isSuspended && user.role !== 'SUPERADMIN') {
          throw new Error('Your company account has been suspended.');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId,
          company: user.company,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email ?? null;
        token.name = user.name ?? null;
        token.role = user.role;
        token.companyId = user.companyId;
        token.company = user.company;
      }
      return token;
    },
    async session({ session, token }) {
      // Override the user object completely
      (session as { user: SessionUser }).user = {
        id: token.id as string,
        email: token.email as string,
        name: token.name as string,
        role: token.role as SessionUser['role'],
        companyId: token.companyId as string,
        company: token.company as SessionUser['company'],
      };
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  trustHost: true,
});

/**
 * Get the current session user or throw an error if not authenticated
 */
export async function getCurrentUser(): Promise<SessionUser> {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  return session.user;
}

/**
 * Check if the current user is a super admin
 */
export async function requireSuperAdmin(): Promise<SessionUser> {
  const user = await getCurrentUser();
  
  if (user.role !== 'SUPERADMIN') {
    throw new Error('Forbidden: Super Admin access required');
  }

  return user;
}

/**
 * Check if the current user has access to the referrer portal
 */
export async function requireReferrerAccess(): Promise<SessionUser> {
  const user = await getCurrentUser();
  
  if (user.role !== 'SUPERADMIN' && !user.company.canUseReferrerPortal) {
    throw new Error('Forbidden: Referrer portal access required');
  }

  return user;
}

/**
 * Check if the current user has access to the provider portal
 */
export async function requireProviderAccess(): Promise<SessionUser> {
  const user = await getCurrentUser();
  
  if (user.role !== 'SUPERADMIN' && !user.company.canUseProviderPortal) {
    throw new Error('Forbidden: Provider portal access required');
  }

  return user;
}
