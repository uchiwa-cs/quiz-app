import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/auth/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "クイズアプリ",
  description: "クイズアプリ",
};

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <Navigation />
          <main className="container mx-auto max-w-screen-md flex-1 px-2">
            {children}
          </main>
          <footer className="py-5">
            <div className="text-center text-sm">
              Copyright &copy; 2022 Quiz App. All rights reserved.copy
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
};

export default RootLayout;
