import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { courseLike } from "@/lib/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const rows = await db
      .select({ count: sql<number>`count(*)` })
      .from(courseLike)
      .where(and(eq(courseLike.courseId, id), eq(courseLike.isLike, true)));

    return Response.json({
        status: 200,
        message: 'success',
        count: Number(rows[0]?.count ?? 0),
    })
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
    const userId = session.user.id;
    const courseId = String(param?.courseId ?? "");
    if (!courseId) {
      return Response.json({ status: 400, message: "courseId is required" });
    }

    const liked = await db
      .select({ id: courseLike.id })
      .from(courseLike)
      .where(and(eq(courseLike.courseId, courseId), eq(courseLike.userId, userId)))
      .then((rows) => rows[0]);

    const updatedAt = new Date();

    const isLike = Boolean(param.isLiked);

    if (!liked) {
        await db.insert(courseLike).values({
          id: randomUUID(),
          courseId,
          userId,
          isLike,
          updatedAt,
        });
    } else {
        await db
          .update(courseLike)
          .set({
            isLike,
            updatedAt,
          })
          .where(eq(courseLike.id, liked.id));
    }

    const [likeCountRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(courseLike)
      .where(and(eq(courseLike.courseId, courseId), eq(courseLike.isLike, true)));

    const likedCount = Number(likeCountRow?.count ?? 0);

    return Response.json({
      status: 200,
      message: "success",
      isLiked: isLike,
      likedCount,
    });
}