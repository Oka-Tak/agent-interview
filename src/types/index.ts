import { AccountType } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      email?: string | null;
      name?: string | null;
      image?: string | null;
      accountId?: string;
      accountType?: AccountType;
      userId?: string;
      recruiterId?: string;
      companyName?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    email?: string;
  }
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface FragmentData {
  type: string;
  content: string;
  skills: string[];
  keywords: string[];
  confidence?: number;
}
