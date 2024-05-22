import NextAuth from "next-auth";
import {PrismaAdapter} from "@auth/prisma-adapter";
import prisma from "@/app/prisma/db";
import Kakao from "next-auth/providers/kakao"
import Naver from "next-auth/providers/naver";

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [Kakao, Naver],
    callbacks: {
        async jwt({ token, account }) {
            console.log('jwt', token);
            console.log('account', account);
            return {
                accessToken: token,
            }
        },
        async session({ session, token }) {
            return {
                ...session,
                ...token,
            }
        },
    },
})

declare module "next-auth" {
    interface Session {
        error?: "RefreshAccessTokenError"
    }
}