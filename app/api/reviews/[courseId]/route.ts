import prisma from "@/app/prisma/db";

export async function GET(request: Request) {

    let returnValues = null;

    const param = request.json().then(async data => {
        console.log('data', data);
        const reviews = await prisma.review.findMany({
            where: {
                courseId: data.courseId
            }
        });

        returnValues = reviews;
    });

    return Response.json({
        status: 200,
        message: 'successfully created.',
        content: returnValues
    });
}
