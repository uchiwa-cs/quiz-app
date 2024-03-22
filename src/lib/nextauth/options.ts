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
      accessToken: string | null | undefined;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    accessToken: string | null | undefined;
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
      //userテーブルのemailとJWTトークンのemailが一致するデータをuserに格納
      const user = await prisma.user.findFirst({
        where: {
          email: token?.email,
        },
      });

      //accountテーブルのuserIdとuserテーブルのuserIdが一致するデータをaccountに格納
      const account = await prisma.account.findFirst({
        where: {
          userId: user?.id,
        },
      });

      //もしuserに値が入っていたら
      if (user) {
        //トークンにuser.idを格納
        token.id = user.id;
        //トークンにaccountのccessTokenを格納
        token.accessToken = account?.access_token;
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
        session.user.accessToken = token.accessToken;
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

//サーバーサイドでのセッション呼び出しを関数化
export const getAuthSession = () => {
  return getServerSession(nextAuthOptions);
};
