// GET /api/course/[id] - 사용자가 클릭한 지점의 코스 조회
import {NextRequest, NextResponse} from "next/server";
import {Course} from "@prisma/client";
import prisma from "@/app/prisma/db";
import {auth} from "@/app/auth";

export async function GET(request: NextRequest, { params }: {
    params: {
        id: string
    }
}) {
    let course = await prisma.course.findUnique({
        where: {
            id: params.id,
            // name: param.name,
        },
        include: {
            courseComments: {
                orderBy: {
                  createdAt: 'desc'
                },
                include: {
                    User: {
                        select: {
                            name: true,
                        }
                    },
                }
            }
        }
    });

    if (!course) {
        return NextResponse.json({
            status: 404,
            message: 'not found data.',
            content: {},
        });
    }

    const session = await auth();

    if (session !== null) {
        const userLiked = await prisma.courseLike.findMany({
            where: {
                courseId: params.id,
                userId: session.user?.id,
            },
        });

        if (userLiked.length === 0) {
            return Response.json({
                status: 200,
                content: {
                    ...course,
                    isLiked: false,
                }
            });
        } else {
            return Response.json({
                status: 200,
                content: {
                    ...course,
                    isLiked: true,
                }
            });
        }
    }

    return NextResponse.json({
        status: 200,
        message: 'successfully searched',
        content: {
            ...course,
            isLiked: false,
        },
    });
}
