CREATE TABLE IF NOT EXISTS "feed_posts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "feed_posts_created_at_idx" ON "feed_posts" ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "feed_posts_user_id_idx" ON "feed_posts" ("user_id");
