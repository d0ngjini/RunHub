import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { courses, savedCourses } from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return Response.json({ status: 401, message: "Authentication failed." });
  }

  const rows = await db
    .select({
      savedId: savedCourses.id,
      savedAt: savedCourses.createdAt,
      course: courses,
    })
    .from(savedCourses)
    .leftJoin(courses, eq(courses.id, savedCourses.courseId))
    .where(eq(savedCourses.userId, session.user.id))
    .orderBy(desc(savedCourses.createdAt));

  return Response.json({
    status: 200,
    content: rows
      .filter((r) => r.course?.id)
      .map((r) => ({
        savedId: r.savedId,
        savedAt: r.savedAt,
        course: r.course,
      })),
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return Response.json({ status: 401, message: "Authentication failed." });
  }

  const param = await request.json();
  const courseId = String(param?.courseId ?? "");
  if (!courseId) {
    return Response.json({ status: 400, message: "courseId is required." });
  }

  const exists = await db
    .select({ id: savedCourses.id })
    .from(savedCourses)
    .where(and(eq(savedCourses.userId, session.user.id), eq(savedCourses.courseId, courseId)))
    .then((rows) => rows[0]);

  if (exists) {
    await db.delete(savedCourses).where(eq(savedCourses.id, exists.id));
    return Response.json({ status: 200, message: "unsaved" });
  }

  await db.insert(savedCourses).values({
    id: randomUUID(),
    userId: session.user.id,
    courseId,
    createdAt: new Date(),
  });

  return Response.json({ status: 200, message: "saved" });
}

