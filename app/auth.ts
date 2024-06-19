import NextAuth, {Session} from "next-auth";
import {PrismaAdapter} from "@auth/prisma-adapter";
import prisma from "@/app/prisma/db";
import Kakao from "next-auth/providers/kakao"
import Naver from "next-auth/providers/naver";
import {Token} from "ol/format/WKT";
import {JWT} from "@auth/core/jwt";

export const {handlers, signIn, signOut, auth} = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [Kakao, Naver],
    session: {
        maxAge: 900,
        updateAge: 300,
    },
    callbacks: {
        async session({session, token}) {
            session.user.id = session.user.id;
            return session;
        },
    }
});

declare module "next-auth" {
    interface Session {
        error?: "RefreshAccessTokenError"
    }
}