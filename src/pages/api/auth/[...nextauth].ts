// src/pages/api/auth/[...nextauth].ts

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Usuário', type: 'text' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (
          credentials?.username === 'elton' &&
          credentials?.password === '123456'
        ) {
          return {
            id: '1',
            name: 'Elton',
            username: 'elton',
            organization: 'Clinivet - 1111',
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && typeof user === 'object') {
        token.name = user.name;
        // @ts-expect-error
        token.username = user.username;
        // @ts-expect-error
        token.organization = user.organization;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.name = token.name as string;
        // @ts-expect-error
        session.user.username = token.username as string;
        // @ts-expect-error
        session.user.organization = token.organization as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'pgwebia-secret',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
