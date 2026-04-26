import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";

export const runtime = "nodejs";

const MAX_BIO = 500;
const MAX_NAME = 64;
const MAX_IMAGE_STR = 450_000;

function clampStr(s: string, max: number) {
  const t = s.trim();
  return t.length > max ? t.slice(0, max) : t;
}

/** 세션 + DB의 bio 등 프로필 */
export async function GET() {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session?.user) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const [row] = await db
    .select({ bio: user.bio })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  return Response.json({
    id: session.user.id,
    name: session.user.name ?? "",
    email: session.user.email ?? null,
    image: session.user.image ?? null,
    bio: row?.bio ?? null,
  });
}

export async function PATCH(request: Request) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session?.user) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { name?: unknown; bio?: unknown; image?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? clampStr(body.name, MAX_NAME) : undefined;
  const bio =
    typeof body.bio === "string" ? clampStr(body.bio, MAX_BIO) : body.bio === null ? null : undefined;
  let image: string | null | undefined;
  if (body.image === null) image = null;
  else if (typeof body.image === "string") {
    if (body.image.length > MAX_IMAGE_STR) {
      return Response.json({ error: "image_too_large" }, { status: 400 });
    }
    image = body.image;
  } else {
    image = undefined;
  }

  if (name === undefined && bio === undefined && image === undefined) {
    return Response.json({ error: "no_fields" }, { status: 400 });
  }

  try {
    await auth.api.updateUser({
      body: {
        ...(name !== undefined ? { name } : {}),
        ...(image !== undefined ? { image } : {}),
        ...(bio !== undefined ? { bio } : {}),
      },
      headers: h,
    });
  } catch {
    return Response.json({ error: "update_failed" }, { status: 400 });
  }

  return Response.json({ ok: true });
}
