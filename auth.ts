import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth, { type DefaultSession } from 'next-auth';
import authConfig from './auth.config';
import { getAccountByUserId } from './data/account';
import { getTwoFactorTokenByUserId } from './data/two-factor-confirmation';
import { getUserById } from './data/user';
import { db } from './lib/db';

export type ExtendedUser = DefaultSession['user'] & {
  role: 'ADMIN' | 'USER';
  isTwoFactorEnabled: boolean;
  isOAuth: boolean;
};

declare module 'next-auth' {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: ExtendedUser;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    // signIn: '/auth/signin',
    error: '/auth/error',
  },
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
        },
      });
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      // Allow OAuth without email verification
      if (account?.provider !== 'credentials') return true;

      const existingUser = await getUserById(user.id as string);

      //Prevent login if email is not verified
      if (!existingUser?.emailVerified) return false;

      // ADD 2fa here
      if (existingUser?.isTwoFactorEnabled) {
        const twoFactorConfirmation = await getTwoFactorTokenByUserId(
          existingUser.id
        );
        if (!twoFactorConfirmation) return false;

        //Delete two factor confirmation for next time sign in;
        await db.twoFactorConfirmation.delete({
          where: { id: twoFactorConfirmation.id },
        });
      }

      return true;
    },
    async session({ token, session }) {
      // console.log('session token', token);
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.role && session.user) {
        session.user = {
          ...session.user,
          role: token.role as 'ADMIN' | 'USER',
        };
      }

      if (session.user) {
        session.user = {
          ...session.user,
          isTwoFactorEnabled: token.isTwoFactorEnabled as boolean,
        };
      }

      if (session.user) {
        session.user = {
          ...session.user,
          email: token.email as string,
          name: token.name as string,
          isOAuth: token.isOAuth as boolean,
        };
      }
      return session;
    },

    async jwt({ token }) {
      // console.log(token);
      // console.log('i am here');
      if (!token.sub) return token;

      const existingUser = await getUserById(token.sub);
      if (!existingUser) return token;

      const existingAccount = await getAccountByUserId(existingUser.id);
      // console.log('existingAccount', existingAccount);
      token.isOAuth = !!existingAccount;

      token.name = existingUser.name;
      token.email = existingUser.email;
      token.role = existingUser.role;
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;
      return token;
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  ...authConfig,
});
