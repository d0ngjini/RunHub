import { eq, inArray } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  account,
  courseComments,
  courseLike,
  courseRating,
  courses,
  notifications,
  savedCourses,
  session,
  user,
} from "@/lib/db/schema";

/**
 * RunHub 도메인 데이터를 정리한 뒤 Better Auth `user` / `session` / `account` 행을 삭제합니다.
 * (FK가 스키마에 없어도 고아 데이터를 남기지 않기 위함)
 */
export async function withdrawUserData(userId: string): Promise<void> {
  await db.transaction(async (tx) => {
    const mine = await tx
      .select({ id: courses.id })
      .from(courses)
      .where(eq(courses.userId, userId));
    const courseIds = mine.map((r) => r.id).filter(Boolean);

    if (courseIds.length > 0) {
      await tx.delete(courseComments).where(inArray(courseComments.courseId, courseIds));
      await tx.delete(courseLike).where(inArray(courseLike.courseId, courseIds));
      await tx.delete(courseRating).where(inArray(courseRating.courseId, courseIds));
      await tx.delete(savedCourses).where(inArray(savedCourses.courseId, courseIds));
      await tx.delete(courses).where(inArray(courses.id, courseIds));
    }

    await tx.delete(courseComments).where(eq(courseComments.authorId, userId));
    await tx.delete(courseLike).where(eq(courseLike.userId, userId));
    await tx.delete(courseRating).where(eq(courseRating.userId, userId));
    await tx.delete(savedCourses).where(eq(savedCourses.userId, userId));
    await tx.delete(notifications).where(eq(notifications.userId, userId));

    await tx.delete(session).where(eq(session.userId, userId));
    await tx.delete(account).where(eq(account.userId, userId));
    await tx.delete(user).where(eq(user.id, userId));
  });
}
