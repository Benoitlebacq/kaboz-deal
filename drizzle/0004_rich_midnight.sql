ALTER TABLE "events" ADD COLUMN "label" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "device" text;--> statement-breakpoint
CREATE INDEX "events_type_idx" ON "events" USING btree ("type");