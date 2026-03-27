import type { DefaultSession } from "next-auth";

type BackendUser = {
  id: string;
  email: string;
  name: string;
  imageUrl: string | null;
  publicCode: string;
  googleSub: string | null;
};

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"];
    backendUser?: BackendUser;
    hasApiAccessToken: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    apiAccessToken?: string;
    backendUser?: BackendUser;
  }
}

export {};
