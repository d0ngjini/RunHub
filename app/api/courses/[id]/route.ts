// GET /api/users/[id] - 특정 사용자 조회
import {NextRequest, NextResponse} from "next/server";
import {Course} from "@prisma/client";
import prisma from "@/app/prisma/db";

export async function GET(request: NextRequest, { params }: {
    params: {
        id: string
    }
}) {
    let course: Course | null = null;

    course = await prisma.course.findUnique({
        where: {
            id: params.id,
            // name: param.name,
        },
        include: {
            reviews: true,
        }
    });

    return NextResponse.json({
        status: 200,
        message: 'successfully searched',
        content: course,
    });
}
