ALTER TABLE "products" ALTER COLUMN "marchand" SET DATA TYPE text USING "marchand"::text;--> statement-breakpoint
DROP TYPE "public"."marchand";