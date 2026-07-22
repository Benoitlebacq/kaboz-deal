import {
  pgTable,
  pgEnum,
  uuid,
  text,
  numeric,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

/**
 * Enums métier (cf. mise-en-place-projet.md §4).
 * `jeux_video` en base ; l'URL publique utilise le slug `jeux-video`
 * (voir sectionToPath/pathToSection dans src/lib/constants.ts).
 */
export const sectionEnum = pgEnum("section", ["tech", "jeux_video"]);
export const marchandEnum = pgEnum("marchand", [
  "amazon",
  "eneba",
  "instant_gaming",
]);

/**
 * Table unique `products` pour démarrer le MVP.
 * Extensions futures possibles : price_history, categories.
 */
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  titre: text("titre").notNull(),
  description: text("description"),
  section: sectionEnum("section").notNull(),
  sousCategorie: text("sous_categorie"),
  marchand: marchandEnum("marchand").notNull(),
  lienAffilie: text("lien_affilie").notNull(),
  imageUrl: text("image_url"),
  // numeric renvoie une string côté Drizzle : parsée dans lib/utils (toNumber).
  prix: numeric("prix", { precision: 10, scale: 2 }),
  prixBarre: numeric("prix_barre", { precision: 10, scale: 2 }),
  devise: text("devise").notNull().default("EUR"),
  // Date de fin optionnelle -> déclenche le bandeau d'expiration (design-front §5.5).
  dateFin: timestamp("date_fin", { withTimezone: true }),
  dateMaj: timestamp("date_maj", { withTimezone: true })
    .notNull()
    .defaultNow(),
  actif: boolean("actif").notNull().default(true),
  misEnAvant: boolean("mis_en_avant").notNull().default(false),
  // Compteur de clics incrémenté par /go/[id].
  clicks: integer("clicks").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Section = (typeof sectionEnum.enumValues)[number];
export type Marchand = (typeof marchandEnum.enumValues)[number];
