// GET /api/course/[id] - 사용자가 클릭한 지점의 코스 조회
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { courseComments, courseLike, courses, user } from "@/lib/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";

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

    const likeCountRows = await db
      .select({ count: sql<number>`count(*)` })
      .from(courseLike)
      .where(and(eq(courseLike.courseId, id), eq(courseLike.isLike, true)));
    const likeCount = Number(likeCountRows[0]?.count ?? 0);

    const comments = await db
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
      .orderBy(desc(courseComments.createdAt));

    const session = await getSession();

    if (session?.user?.id) {
        const userLiked = await db
          .select({ isLike: courseLike.isLike })
          .from(courseLike)
          .where(and(eq(courseLike.courseId, id), eq(courseLike.userId, session.user.id)));

        // 안전한 length 체크
        if (!userLiked || userLiked.length === 0) {
            return Response.json({
                status: 200,
                content: {
                    ...courseRow,
                    courseComments: comments,
                    isLiked: false,
                    likedCount: likeCount,
                }
            });
        } else {
            return Response.json({
                status: 200,
                content: {
                    ...courseRow,
                    courseComments: comments,
                    isLiked: userLiked[0]?.isLike ?? false,
                    likedCount: likeCount,
                }
            });
        }
    }

    return NextResponse.json({
        status: 200,
        message: 'successfully searched',
        content: {
            ...courseRow,
            courseComments: comments,
            isLiked: false,
            likedCount: likeCount
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
