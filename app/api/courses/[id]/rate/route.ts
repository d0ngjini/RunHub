import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { courseRating } from "@/lib/db/schema";
import { and, count, eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

function clampStars(n: unknown): number | null {
  const x = Number(n);
  if (!Number.isFinite(x)) return null;
  const r = Math.round(x);
  if (r < 1 || r > 5) return null;
  return r;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return Response.json({ status: 401, message: "로그인이 필요합니다." });
  }

  const { id: courseId } = await params;
  const body = (await request.json().catch(() => ({}))) as { stars?: number };
  const stars = clampStars(body.stars);
  if (!courseId || stars === null) {
    return Response.json({ status: 400, message: "1~5 별점이 필요합니다." });
  }

  const userId = session.user.id;
  const updatedAt = new Date();

  const existing = await db
    .select({ id: courseRating.id })
    .from(courseRating)
    .where(and(eq(courseRating.courseId, courseId), eq(courseRating.userId, userId)))
    .then((rows) => rows[0]);

  if (existing) {
    await db
      .update(courseRating)
      .set({ stars, updatedAt })
      .where(eq(courseRating.id, existing.id));
  } else {
    await db.insert(courseRating).values({
      id: randomUUID(),
      userId,
      courseId,
      stars,
      updatedAt,
    });
  }

  const [agg] = await db
    .select({
      avg: sql<number>`coalesce(avg(${courseRating.stars}::float), 0)`,
      n: count(),
    })
    .from(courseRating)
    .where(eq(courseRating.courseId, courseId));

  return Response.json({
    status: 200,
    userRating: stars,
    avgRating: Number(agg?.avg ?? 0),
    ratingCount: Number(agg?.n ?? 0),
  });
}
