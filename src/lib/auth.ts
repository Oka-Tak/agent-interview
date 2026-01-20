import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      const existingAccount = await prisma.account.findUnique({
        where: { email: user.email },
      });

      if (!existingAccount) {
        return `/register?email=${encodeURIComponent(user.email)}&name=${encodeURIComponent(user.name || "")}`;
      }

      return true;
    },
    async session({ session, token }) {
      if (session.user && token.email) {
        const account = await prisma.account.findUnique({
          where: { email: token.email },
          include: {
            user: true,
            recruiter: true,
          },
        });

        if (account) {
          session.user.accountId = account.id;
          session.user.accountType = account.accountType;
          if (account.user) {
            session.user.userId = account.user.id;
            session.user.name = account.user.name;
          }
          if (account.recruiter) {
            session.user.recruiterId = account.recruiter.id;
            session.user.companyName = account.recruiter.companyName;
          }
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user && user.email) {
        token.email = user.email;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
