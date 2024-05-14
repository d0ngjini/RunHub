import {NextRequest, NextResponse} from "next/server";
import prisma from "@/app/prisma/db";
import dayjs from "dayjs";
import {auth} from "@/app/auth";

export async function POST(req: NextRequest) {

    let values = null;

    await req.json().then(async param => {
        const session = await auth()
        console.log('session', session);
        values = await prisma.course.findUnique({
            where: {
                id: param.id,
                name: param.name,
            }
        });

        values.date = dayjs(values.createdAt).format('YYYY-MM-DD HH:mm:ss');
    });

    return NextResponse.json({
        status: 200,
        message: 'successfully searched',
        content: values,
    });
}




