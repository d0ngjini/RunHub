import { PrismaClient } from "@prisma/client";
import {NextResponse} from "next/server";
import prisma from "@/app/prisma/db";
import {auth} from "@/app/auth";
import {Simulate} from "react-dom/test-utils";

export async function POST(request: Request) {
    const response = new NextResponse();
    const session = await auth();

    console.log('session', session);

    if (session === null) {
        return Response.json({
            status: 401,
            message: "Authentication failed.",
        })
    }

    const param = await request.json();
    param.createdAt = new Date().toISOString();
    const created = await prisma.course.create({
        data: param,
    });

    if (created) {
        return Response.json({
            status: 200,
            message: 'successfully created.'
        });
    } else {
        return Response.json({
            status: 404,
            message: 'failed to create course.',
        });
    }
}
