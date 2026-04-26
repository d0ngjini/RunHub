import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { withdrawUserData } from "@/lib/withdraw-user";

export const runtime = "nodejs";

export async function POST() {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session?.user) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    await withdrawUserData(session.user.id);
  } catch (e) {
    console.error("[withdraw]", e);
    return Response.json({ error: "withdraw_failed" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
