"use client";

import type { User } from "next-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { signOut } from "next-auth/react";
import UserAvatar from "../UserAvatar";

type UserNavigationProps = {
  user: Pick<User, "name" | "image" | "email">;
};

//ユーザーナビゲーション
const UserNavigation = (props: UserNavigationProps) => {
  const { user } = props;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatar
          className="w-9 h-9"
          user={{
            name: user.name || null,
            image: user.image || null,
          }}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="bg-white p-2" align="end">
        <div className="text-sm w-[250px]">
          <div className="mb-2">{user.name || ""}</div>
          <div>{user.email || ""}</div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={async (event) => {
            event.preventDefault();
            await signOut();
          }}
          className="text-red-600 cursor-pointer"
        >
          ログアウト
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserNavigation;
