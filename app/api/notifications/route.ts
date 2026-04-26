import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { and, desc, eq, isNull } from "drizzle-orm";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return Response.json({ status: 401, message: "Authentication failed." });
  }

  const url = new URL(request.url);
  const unreadOnly = url.searchParams.get("unread") === "1";

  const where = unreadOnly
    ? and(eq(notifications.userId, session.user.id), isNull(notifications.readAt))
    : eq(notifications.userId, session.user.id);

  const rows = await db
    .select()
    .from(notifications)
    .where(where)
    .orderBy(desc(notifications.createdAt))
    .limit(50);

  return Response.json({ status: 200, content: rows });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return Response.json({ status: 401, message: "Authentication failed." });
  }

  const param = await request.json();
  const type = String(param?.type ?? "system");
  const title = String(param?.title ?? "알림");
  const body = param?.body == null ? null : String(param.body);
  const data = param?.data ?? null;

  await db.insert(notifications).values({
    id: randomUUID(),
    userId: session.user.id,
    type,
    title,
    body,
    data,
    createdAt: new Date(),
  });

  return Response.json({ status: 200, message: "created" });
}

