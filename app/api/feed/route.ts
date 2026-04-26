import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { feedPosts } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

const MAX_TITLE = 200;
const MAX_BODY = 8000;
const DefaultLimit = 20;
const MaxLimit = 50;

function parseCreateBody(b: unknown): { ok: true; title: string; body: string } | { ok: false; message: string } {
  if (b === null || typeof b !== "object") {
    return { ok: false, message: "잘못된 요청입니다." };
  }
  const t = (b as { title?: unknown; body?: unknown }).title;
  const d = (b as { body?: unknown }).body;
  if (typeof t !== "string" || typeof d !== "string") {
    return { ok: false, message: "제목·본문을 입력해 주세요." };
  }
  const title = t.trim();
  const body = d.trim();
  if (!title) return { ok: false, message: "제목을 입력해 주세요." };
  if (!body) return { ok: false, message: "본문을 입력해 주세요." };
  if (title.length > MAX_TITLE) return { ok: false, message: "제목이 너무 깁니다." };
  if (body.length > MAX_BODY) return { ok: false, message: "본문이 너무 깁니다." };
  return { ok: true, title, body };
}

/**
 * 러닝 커뮤니티 피드 목록 (공개, 최신순, 페이지)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(0, Math.floor(Number(searchParams.get("page") || "0")) || 0);
  const limit = Math.min(
    MaxLimit,
    Math.max(1, Math.floor(Number(searchParams.get("limit") || String(DefaultLimit))) || DefaultLimit)
  );
  const offset = page * limit;

  const base = await db
    .select({
      id: feedPosts.id,
      userId: feedPosts.userId,
      title: feedPosts.title,
      body: feedPosts.body,
      createdAt: feedPosts.createdAt,
      authorName: user.name,
      authorImage: user.image,
    })
    .from(feedPosts)
    .leftJoin(user, eq(feedPosts.userId, user.id))
    .orderBy(desc(feedPosts.createdAt))
    .limit(limit + 1)
    .offset(offset);

  const hasMore = base.length > limit;
  const content = (hasMore ? base.slice(0, limit) : base).map((row) => ({
    ...row,
    createdAt: row.createdAt?.toISOString() ?? null,
  }));

  return Response.json({
    status: 200,
    page,
    limit,
    hasMore,
    content,
  });
}

/**
 * 게시글 작성
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return Response.json({ status: 401, message: "로그인이 필요합니다." }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ status: 400, message: "JSON 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const parsed = parseCreateBody(json);
  if (!parsed.ok) {
    return Response.json({ status: 400, message: parsed.message }, { status: 400 });
  }

  const { title, body: bodyText } = parsed;
  const id = randomUUID();
  const now = new Date();

  await db.insert(feedPosts).values({
    id,
    userId: session.user.id,
    title,
    body: bodyText,
    createdAt: now,
    updatedAt: now,
  });

  return Response.json({ status: 200, id });
}
