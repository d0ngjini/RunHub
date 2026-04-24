import {NextRequest} from "next/server";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { courseComments } from "@/lib/db/schema";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> },
) {
    const body = await request.json();
    const { courseId } = await params;

    const session = await getSession();

    if (!session?.user?.id) {
        return Response.json({
            status: 401,
            message: 'no such session.',
        });
    }

    await db.insert(courseComments).values({
      id: randomUUID(),
      courseId,
      authorId: session.user.id,
      comment: body.value,
      createdAt: new Date(),
    });

    return Response.json({
        status: 200,
        message: 'successfully created.',
    });
}
