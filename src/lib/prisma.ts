import { PrismaClient } from "@prisma/client";

// グローバルスコープでprisma変数を定義する
declare global {
  var prisma: PrismaClient | undefined;
}

// グローバルスコープで定義されたprisma変数を使用するか、新しいPrismaClientインスタンスを作成する
const prisma = globalThis.prisma || new PrismaClient();

// 開発環境でない場合、グローバルスコープのprisma変数にprismaを割り当てる
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

// prisma変数をデフォルトエクスポートする
export default prisma;
