import type {Metadata} from "next";
import {Inter, Noto_Sans_KR} from "next/font/google";
import "./globals.css";
import React from "react";
import {SessionProvider} from "next-auth/react"

const inter = Inter({ subsets: ["latin"] });
const NotoSansKR = Noto_Sans_KR({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RunHub",
  description: "런허브",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <SessionProvider>
        <html lang="en">
          <body className={NotoSansKR.className}>{children}</body>
        </html>
      </SessionProvider>
  );
}
