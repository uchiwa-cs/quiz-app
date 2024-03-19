"use client";

import Link from "next/link";
import type { Session } from "next-auth";
import LoginButton from "@/components/auth/LoginButton";
import UserNavigation from "@/components/auth/UserNavigation";
import { Button } from "@/components/ui/button";

type NavigationProps = {
  session: Session | null;
};

const Navigation = (props: NavigationProps) => {
  const { session } = props;
  return (
    <header className="shadoe-lg shadow-gray-100 mb-10">
      <div className="container mx-auto flex max-w-screen-md items-center justify-between px-2 py-3">
        <Link href="/" className="cursor-pointer text-xl font-bold">
          Quiz App
        </Link>
        {/* ユーザーがログインしている場合のみ表示 */}
        {session?.user ? (
          <div className="flex items-center justify-center space-x-5">
            <Button asChild variant="outline">
              <Link href="/quiz/new">クイズ作成</Link>
            </Button>
            <UserNavigation user={session.user} />
          </div>
        ) : (
          // ログインしていない場合のみ表示
          <Button asChild>
            <Link href="/login">ログイン</Link>
          </Button>
        )}
      </div>
    </header>
  );
};

export default Navigation;
