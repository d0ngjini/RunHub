import prisma from "@/app/prisma/db";
import {NextRequest} from "next/server";
import {auth} from "@/app/auth";

export async function POST(request: NextRequest, { params } : {
    params: Record<string, any>;
}) {
    const body = await request.json();
    const { courseId } = params;

    const session = await auth();

    if (session === null || session.user?.id === undefined) {
        return Response.json({
            status: 401,
            message: 'no such session.',
        });
    }

    await prisma.courseComment.create({
        data: {
            courseId: courseId,
            authorId: session.user.id,
            comment: body.value,
            createdAt: new Date().toISOString(),
        }
    });

    return Response.json({
        status: 200,
        message: 'successfully created.',
    });
}
