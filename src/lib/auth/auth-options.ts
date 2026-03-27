import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { exchangeBackendToken } from "@/lib/auth/exchange-backend-token";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === "google" && profile) {
        const googleProfile = profile as Record<string, unknown>;
        const email = typeof googleProfile.email === "string" ? googleProfile.email : "";
        const name =
          typeof googleProfile.name === "string" && googleProfile.name.trim().length > 0
            ? googleProfile.name.trim()
            : email;
        const googleSub = typeof googleProfile.sub === "string" ? googleProfile.sub : "";
        const imageUrl =
          typeof googleProfile.picture === "string" ? googleProfile.picture : undefined;

        if (!email || !googleSub) {
          throw new Error("Google profile is missing required fields: email/sub.");
        }

        const exchange = await exchangeBackendToken({
          email,
          name,
          imageUrl,
          googleSub,
        });

        token.apiAccessToken = exchange.accessToken;
        token.backendUser = exchange.user;
      }

      return token;
    },
    async session({ session, token }) {
      if (token.backendUser) {
        session.backendUser = token.backendUser;
      }
      session.hasApiAccessToken = Boolean(token.apiAccessToken);
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};
