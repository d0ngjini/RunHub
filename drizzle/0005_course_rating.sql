CREATE TABLE IF NOT EXISTS "course_rating" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "course_id" text NOT NULL,
  "stars" integer NOT NULL,
  "updated_at" timestamptz NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "course_rating_user_course_uq" ON "course_rating" ("user_id", "course_id");
CREATE INDEX IF NOT EXISTS "course_rating_course_id_idx" ON "course_rating" ("course_id");
