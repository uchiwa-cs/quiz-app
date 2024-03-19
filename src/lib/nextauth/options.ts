import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import prisma from "@/lib/prisma";
import NextAuth from "next-auth/next";

//Sessionの型の拡張
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}

export const nextAuthOptions: NextAuthOptions = {
  debug: false,
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],

  // セッションの設定を JWT ストラテジーに設定
  session: {
    strategy: "jwt",
  },

  //暗号化に使用する SECRET を設定
  secret: process.env.NEXTAUTH_SECRET,

  //// JWT トークンとセッションのコールバック関数を定義
  callbacks: {
    jwt: async ({ token }) => {
      //データベース上のemailとJWTトークンのemailが一致するデータをuserに格納
      const user = await prisma.user.findFirst({
        where: {
          email: token?.email,
        },
      });
      //もしuserに値が入っていたら
      if (user) {
        //JWTトークンにuser.idを格納
        token.id = user.id;
      }
      //JWTトークンを返す
      return token;
    },
    session: ({ session, token }) => {
      //JWTトークンが存在したら
      if (token) {
        //セッションにトークンの情報を含めて
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }
      //返却
      return session;
    },
  },

  //ログイン画面
  pages: {
    signIn: "login",
  },
};

export const getAuthSession = () => {
  return getServerSession(nextAuthOptions);
};
