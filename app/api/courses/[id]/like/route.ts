import {auth} from "@/app/auth";
import prisma from "@/app/prisma/db";

export async function GET(request: Request,  { params } : {
    params: Record<string, any>;
}) {

    console.log('params', params)
    console.log('/courses/id/like GET', request);

    const count = await prisma.courseLike.aggregate({
        _count: {
            isLike: true
        },
        where: {
            courseId: params.id,
            isLike: true,
        },
    });

    return Response.json({
        status: 200,
        message: 'success',
        data: {
            count: count,
        }
    })
}

export async function POST(request: Request) {
    const session = await auth();

    if (session === null) {
        return Response.json({
            status: 401,
            message: "Authentication failed.",
        })
    }

    const param = await request.json();

    let liked = await prisma.courseLike.findFirst({
        where: {
            courseId: param.courseId,
            userId: param.userId
        }
    });

    const isoString = new Date().toISOString();

    if (!liked) {
        await prisma.courseLike.create({
            data: {
                courseId: param.courseId,
                userId: param.userId,
                isLike: param.isLiked,
                updatedAt: isoString,
            }
        });

        return Response.json({
            status: 200,
            message: 'successfully created.'
        });
    } else {
        await prisma.courseLike.update({
            where: {
                id: liked.id,
            },
            data: {
                isLike: param.isLiked,
                updatedAt: isoString,
            }
        })

        return Response.json({
            status: 200,
            message: 'successfully updated.'
        });
    }
}