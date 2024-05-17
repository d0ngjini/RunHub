import {NextRequest, NextResponse} from "next/server";
import prisma from "@/app/prisma/db";
import dayjs from "dayjs";
import {auth} from "@/app/auth";
import {Course} from "@prisma/client";

export async function POST(req: NextRequest) {

    let course: Course | null = null;

    await req.json().then(async param => {
        const session = await auth()
        console.log('session', session);
        course = await prisma.course.findUnique({
            where: {
                id: param.id,
                name: param.name,
            }
        });
    });

    return NextResponse.json({
        status: 200,
        message: 'successfully searched',
        content: course,
    });
}




