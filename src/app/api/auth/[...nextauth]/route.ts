import { nextAuthOptions } from "@/lib/nextauth/options";
import NextAuth from "next-auth/next";

const hendler = NextAuth(nextAuthOptions);

export { hendler as GET, hendler as POST };
