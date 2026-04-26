// GET /api/course/[id] - 사용자가 클릭한 지점의 코스 조회
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import {
  courseComments,
  courseLike,
  courseRating,
  courses,
  savedCourses,
  user,
} from "@/lib/db/schema";
import { and, count, desc, eq, sql } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const courseRow = await db
      .select()
      .from(courses)
      .where(eq(courses.id, id))
      .then((rows) => rows[0]);

    if (!courseRow) {
        return NextResponse.json({
            status: 404,
            message: 'not found data.',
            content: {},
        });
    }

    const [likeCountRows, ratingAggList, commentRows, session] = await Promise.all([
        db
            .select({ count: sql<number>`count(*)` })
            .from(courseLike)
            .where(and(eq(courseLike.courseId, id), eq(courseLike.isLike, true))),
        db
            .select({
                avg: sql<number>`coalesce(avg(${courseRating.stars}::float), 0)`,
                n: count(),
            })
            .from(courseRating)
            .where(eq(courseRating.courseId, id)),
        db
            .select({
                id: courseComments.id,
                comment: courseComments.comment,
                createdAt: courseComments.createdAt,
                User: {
                    name: user.name,
                },
            })
            .from(courseComments)
            .leftJoin(user, eq(user.id, courseComments.authorId))
            .where(eq(courseComments.courseId, id))
            .orderBy(desc(courseComments.createdAt)),
        getSession(),
    ]);

    const likeCount = Number(likeCountRows[0]?.count ?? 0);
    const [ratingAgg] = ratingAggList;
    const comments = commentRows;

    const uid = session?.user?.id;
    let isLiked = false;
    let userRating = 0;
    let isBookmarked = false;
    if (uid) {
        const [userLiked, ur, sv] = await Promise.all([
            db
                .select({ isLike: courseLike.isLike })
                .from(courseLike)
                .where(and(eq(courseLike.courseId, id), eq(courseLike.userId, uid)))
                .then((rows) => rows[0]),
            db
                .select({ stars: courseRating.stars })
                .from(courseRating)
                .where(and(eq(courseRating.courseId, id), eq(courseRating.userId, uid)))
                .limit(1)
                .then((rows) => rows[0]),
            db
                .select({ id: savedCourses.id })
                .from(savedCourses)
                .where(and(eq(savedCourses.courseId, id), eq(savedCourses.userId, uid)))
                .limit(1)
                .then((rows) => rows[0]),
        ]);
        isLiked = Boolean(userLiked?.isLike);
        userRating = ur?.stars ?? 0;
        isBookmarked = Boolean(sv);
    }

    return NextResponse.json({
      status: 200,
      content: {
        ...courseRow,
        courseComments: comments,
        isLiked,
        likedCount: likeCount,
        avgRating: Number(ratingAgg?.avg ?? 0),
        ratingCount: Number(ratingAgg?.n ?? 0),
        userRating,
        isBookmarked,
      },
    });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const session = await getSession();

    if (!session?.user?.id) {
        return Response.json({
            status: 401,
            message: 'unauthenticated user'
        })
    }

    const deleted = await db
      .delete(courses)
      .where(and(eq(courses.id, id), eq(courses.userId, session.user.id)))
      .returning({ id: courses.id });

    if (deleted.length > 0) {
        return Response.json({
            status: 200,
            message: 'successfully deleted',
        });
    } else {
        return Response.json({
            status: 404,
            message: 'not found data',
        });
    }
}
