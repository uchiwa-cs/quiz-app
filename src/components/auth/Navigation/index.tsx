"use client";

import Link from "next/link";

const Navigation = () => {
  return (
    <header className="shadoe-lg shadow-gray-100 mb-10">
      <div className="container mx-auto flex max-w-screen-md items-center justify-between px-2 py-3">
        <Link href="/" className="cursor-pointer text-xl font-bold">
          Quiz App
        </Link>
      </div>
    </header>
  );
};

export default Navigation;
