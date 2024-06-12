import {auth} from "@/app/auth";
import prisma from "@/app/prisma/db";

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
    const created = await prisma.courseLike.create({
        data: {
            courseId: '',
            userId: '',
            isLike: false,
            updatedAt: new Date().toISOString(),
        }
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