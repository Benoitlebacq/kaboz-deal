CREATE TYPE "public"."marchand" AS ENUM('amazon', 'eneba', 'instant_gaming');--> statement-breakpoint
CREATE TYPE "public"."section" AS ENUM('tech', 'jeux_video');--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"titre" text NOT NULL,
	"description" text,
	"section" "section" NOT NULL,
	"sous_categorie" text,
	"marchand" "marchand" NOT NULL,
	"lien_affilie" text NOT NULL,
	"image_url" text,
	"prix" numeric(10, 2),
	"prix_barre" numeric(10, 2),
	"devise" text DEFAULT 'EUR' NOT NULL,
	"date_fin" timestamp with time zone,
	"date_maj" timestamp with time zone DEFAULT now() NOT NULL,
	"actif" boolean DEFAULT true NOT NULL,
	"mis_en_avant" boolean DEFAULT false NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
