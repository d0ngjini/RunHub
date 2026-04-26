import { getSession } from "@/lib/auth-server";
import dayjs from "dayjs";
import { db } from "@/lib/db";
import { courses } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

export async function GET() {
    const rows = await db.select().from(courses).orderBy(desc(courses.createdAt));

    const content = rows.map((c) => ({
      ...c,
      convertedDate: dayjs(c.createdAt).format("YYYY-MM-DD HH:mm:ss"),
    }));

    return Response.json({
        status: 200,
        content,
    });
}

export async function POST(request: Request) {
    const session = await getSession();

    if (!session?.user?.id) {
        return Response.json({
            status: 401,
            message: "Authentication failed.",
        })
    }

    const param = await request.json();

    const createdAt = new Date();
    const userId = session.user.id;

    const inserted = await db
      .insert(courses)
      .values({
        id: randomUUID(),
        name: param.name,
        address: param.address ?? null,
        flatCoordinates: param.flatCoordinates,
        extent: param.extent ?? null,
        description: param.description,
        createdAt,
        userId,
      })
      .returning({ id: courses.id });

    if (inserted.length > 0) {
        return Response.json({
            status: 200,
            message: "successfully created.",
            id: inserted[0]!.id,
        });
    } else {
        return Response.json({
            status: 404,
            message: 'failed to create courses.',
        });
    }
}