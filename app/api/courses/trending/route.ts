import { db } from "@/lib/db";
import { courseLike, courseRating, courses, savedCourses } from "@/lib/db/schema";
import { count, eq, sql } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * 추천 점수: 추천(좋아요) + 북마크 + 별점 참여도를 합산해 순위를 매깁니다.
 * 주기적으로 호출되면 지표 변화에 따라 순위가 바뀝니다.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(20, Math.max(3, Number(searchParams.get("limit")) || 8));

  try {
    const likeRows = await db
    .select({
      courseId: courseLike.courseId,
      n: count(),
    })
    .from(courseLike)
    .where(eq(courseLike.isLike, true))
    .groupBy(courseLike.courseId);

    const saveRows = await db
    .select({
      courseId: savedCourses.courseId,
      n: count(),
    })
    .from(savedCourses)
    .groupBy(savedCourses.courseId);

    const rateRows = await db
    .select({
      courseId: courseRating.courseId,
      n: count(),
      avg: sql<number>`coalesce(avg(${courseRating.stars}::float), 0)`,
    })
    .from(courseRating)
    .groupBy(courseRating.courseId);

    const likeMap = new Map(likeRows.map((r) => [r.courseId, r.n]));
    const saveMap = new Map(saveRows.map((r) => [r.courseId, r.n]));
    const rateMap = new Map(rateRows.map((r) => [r.courseId, { n: r.n, avg: Number(r.avg) }]));

    const allCourses = await db.select().from(courses);

    const scored = allCourses
      .map((c) => {
        const lc = likeMap.get(c.id) ?? 0;
        const sc = saveMap.get(c.id) ?? 0;
        const ra = rateMap.get(c.id);
        const rateN = ra?.n ?? 0;
        const rateAvg = ra?.avg ?? 0;
        const score = lc * 2.2 + sc * 1.8 + rateN * 0.4 + rateAvg * 1.2;
        return {
          course: c,
          likeCount: lc,
          saveCount: sc,
          ratingCount: rateN,
          avgRating: rateAvg,
          score,
        };
      })
      .sort((a, b) => {
        const tie =
          new Date(b.course.createdAt as Date | string).getTime() -
          new Date(a.course.createdAt as Date | string).getTime();
        return b.score - a.score || tie;
      })
      .slice(0, limit)
      .map((row, i) => ({
        rank: i + 1,
        id: row.course.id,
        name: row.course.name,
        description: row.course.description,
        likeCount: row.likeCount,
        saveCount: row.saveCount,
        ratingCount: row.ratingCount,
        avgRating: row.avgRating,
      }));

    return Response.json({ status: 200, content: scored });
  } catch (e) {
    console.error("[trending]", e);
    return Response.json({ status: 200, content: [], degraded: true });
  }
}
