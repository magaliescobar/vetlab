import type { NextAuthConfig } from 'next-auth';
import type { UserRole } from '@/lib/models/user';
 
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  // Auth.js valida el Host antes de emitir sesiones; en despliegues
  // self-hosted (no Vercel) hay que confiarlo explícitamente.
  trustHost: true,
   callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      // Todas las páginas son públicas; solo rebota a /dashboard desde
      // /login cuando ya hay sesión. El rol admin se valida en las
      // server actions y en los componentes AdminOnly.
      if (nextUrl.pathname === '/login' && isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    session({ session, token }) {
      // token.role viene del índice Record<string, unknown> de JWT.
      if (session.user) session.user.role = token.role as UserRole | undefined;
      return session;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;