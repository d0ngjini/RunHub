import { PrismaClient } from "@prisma/client";
import {NextResponse} from "next/server";
import prisma from "@/app/prisma/db";

export async function POST(request: Request) {
    const response = new NextResponse();
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
