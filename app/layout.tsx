import type {Metadata, Viewport} from "next";
import {Inter, Noto_Sans_KR} from "next/font/google";
import "./globals.css";
import React from "react";
import {SessionProvider} from "next-auth/react"

const inter = Inter({subsets: ["latin"]});
const NotoSansKR = Noto_Sans_KR({
    subsets: ["latin"],
    weight: ["100", "400", "700", "900"],
});

export const metadata: Metadata = {
    title: "Explore, Share, Achieve! | RunHub",
    description: "RunHub를 통해 좋은 러닝코스를 찾아보고, 나만의 러닝코스를 공유해보세요!",
    icons: {
        icon: "/favicon-96x96.png",
        apple: '/apple-icon.png',
    }
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    // Also supported by less commonly used
    // interactiveWidget: 'resizes-visual',
}

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (

            <html lang="en">
                <body className={NotoSansKR.className}>
                    <SessionProvider>
                        {children}
                    </SessionProvider>
                </body>
            </html>
    );
}
