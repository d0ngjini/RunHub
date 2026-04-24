import type { InferSelectModel } from "drizzle-orm";
import type { courses, courseComments, courseLike } from "@/lib/db/schema";

export type Course = InferSelectModel<typeof courses>;
export type CourseComment = InferSelectModel<typeof courseComments>;
export type CourseLike = InferSelectModel<typeof courseLike>;

