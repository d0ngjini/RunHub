import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { feedPosts } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * 본인 게시글만 삭제
 */
export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return Response.json({ status: 401, message: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id?.trim()) {
    return Response.json({ status: 400, message: "잘못된 요청입니다." }, { status: 400 });
  }

  const deleted = await db
    .delete(feedPosts)
    .where(and(eq(feedPosts.id, id), eq(feedPosts.userId, session.user.id)))
    .returning({ id: feedPosts.id });

  if (deleted.length === 0) {
    return Response.json(
      { status: 404, message: "삭제할 글이 없거나 권한이 없습니다." },
      { status: 404 }
    );
  }

  return Response.json({ status: 200 });
}
