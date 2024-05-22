import prisma from "@/app/prisma/db";
import {auth} from "@/app/auth";
import dayjs from "dayjs";

export async function GET() {
    const courses = await prisma.course.findMany({
        // include: {
        //     reviews: true,
        // }
    });

    courses.forEach((c: any) => {
        const convertedDate = dayjs(c.createdAt).format('YYYY-MM-DD HH:mm:ss');
        c.convertedDate = convertedDate;
    });

    return Response.json({
        status: 200,
        content: courses
    });
}

export async function POST(request: Request) {
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
            message: 'failed to create courses.',
        });
    }
}