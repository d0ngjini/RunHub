import prisma from "@/app/prisma/db";
import dayjs from 'dayjs';

export async function GET() {
    const courses = await prisma.course.findMany();
    courses.forEach((c: any) => {
        const convertedDate = dayjs(c.createdAt).format('YYYY-MM-DD HH:mm:ss');
        c.convertedDate = convertedDate;
    });

    console.log('courses', courses);

    return Response.json({
        status: 200,
        message: 'successfully created.',
        content: courses
    });
}
