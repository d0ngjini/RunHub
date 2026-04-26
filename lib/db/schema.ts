// Generated/migrated via Better Auth CLI + drizzle-kit.
// We keep it explicit in-repo for reproducible migrations.
import {
  pgTable,
  text,
  timestamp,
  boolean,
  jsonb,
  uniqueIndex,
  index,
  integer,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Better Auth tables (clean start)
// ---------------------------------------------------------------------------

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").unique(),
  // Better Auth expects boolean, not a timestamp.
  emailVerified: boolean("email_verified").default(false),
  image: text("image"),
  /** 짧은 자기소개(프로필) */
  bio: text("bio"),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  idToken: text("id_token"),
  scope: text("scope"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

// ---------------------------------------------------------------------------
// RunHub domain tables (replaces Prisma usage)
// ---------------------------------------------------------------------------

export const courses = pgTable("courses", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address"),
  flatCoordinates: text("flat_coordinates").notNull(),
  extent: text("extent"),
  description: text("description").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  userId: text("user_id"),
});

export const courseComments = pgTable("course_comments", {
  id: text("id").primaryKey(),
  courseId: text("course_id").notNull(),
  authorId: text("user_id").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const courseLike = pgTable("course_like", {
  id: text("id").primaryKey(),
  courseId: text("course_id").notNull(),
  userId: text("user_id").notNull(),
  isLike: boolean("is_like").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

/** 사용자별 1~5 별점 (같은 코스에 1행만) */
export const courseRating = pgTable(
  "course_rating",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    courseId: text("course_id").notNull(),
    stars: integer("stars").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (t) => ({
    userCourseUnique: uniqueIndex("course_rating_user_course_uq").on(t.userId, t.courseId),
    courseIdIdx: index("course_rating_course_id_idx").on(t.courseId),
  })
);

// ---------------------------------------------------------------------------
// User features: saved + notifications
// ---------------------------------------------------------------------------

export const savedCourses = pgTable(
  "saved_courses",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    courseId: text("course_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (t) => ({
    userCourseUnique: uniqueIndex("saved_courses_user_course_uq").on(t.userId, t.courseId),
    courseIdIdx: index("saved_courses_course_id_idx").on(t.courseId),
  })
);

export const notifications = pgTable(
  "notifications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    type: text("type").notNull(), // e.g. like, comment, system
    title: text("title").notNull(),
    body: text("body"),
    data: jsonb("data"), // flexible payload
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (t) => ({
    userCreatedIdx: index("notifications_user_created_idx").on(t.userId, t.createdAt),
    userUnreadIdx: index("notifications_user_unread_idx").on(t.userId, t.readAt),
  })
);

// ---------------------------------------------------------------------------
// 러닝 커뮤니티 피드 (게시글)
// ---------------------------------------------------------------------------

export const feedPosts = pgTable(
  "feed_posts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (t) => ({
    createdDescIdx: index("feed_posts_created_at_idx").on(t.createdAt),
    userIdIdx: index("feed_posts_user_id_idx").on(t.userId),
  })
);

