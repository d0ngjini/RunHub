ALTER TABLE "user"
ALTER COLUMN "email_verified" TYPE boolean
USING false;

ALTER TABLE "user"
ALTER COLUMN "email_verified" SET DEFAULT false;