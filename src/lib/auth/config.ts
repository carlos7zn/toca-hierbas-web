import NextAuth, { type NextAuthConfig } from 'next-auth';
import Discord from 'next-auth/providers/discord';
import { upsertUser } from '@/lib/db/queries';

export const authConfig: NextAuthConfig = {
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'discord' && user.id) {
        try {
          await upsertUser({
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            discordId: user.id,
            discriminator: account.providerAccountId,
          });
        } catch (error) {
          console.error('Error upserting user:', error);
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);