import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "@/db";
import { events } from "@/db/schema";

function deviceFromUA(ua: string | null): string {
  if (!ua) return "desktop";
  return /Mobi|Android|iPhone|iPad|iPod/i.test(ua) ? "mobile" : "desktop";
}

function sectionFromPath(path: string): "tech" | "jeux_video" | null {
  if (path === "/tech" || path.startsWith("/tech/")) return "tech";
  if (path === "/jeux-video" || path.startsWith("/jeux-video/"))
    return "jeux_video";
  return null;
}

const noContent = () => new NextResponse(null, { status: 204 });

/** Log d'audience (vues / recherches). Public, best-effort, sans PII. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || (body.type !== "view" && body.type !== "search")) {
      return noContent();
    }
    const db = getDb();
    if (!db) return noContent();

    const device = deviceFromUA(request.headers.get("user-agent"));

    if (body.type === "view") {
      const path = String(body.path ?? "").slice(0, 300);
      // On ne logge que les pages publiques de contenu.
      if (
        !path.startsWith("/") ||
        path.startsWith("/admin") ||
        path.startsWith("/api") ||
        path.startsWith("/go")
      ) {
        return noContent();
      }
      await db.insert(events).values({
        type: "view",
        label: path,
        section: sectionFromPath(path),
        device,
      });
    } else {
      const q = String(body.q ?? "")
        .trim()
        .slice(0, 100);
      if (q) {
        await db.insert(events).values({ type: "search", label: q, device });
      }
    }
  } catch {
    // best-effort : on ignore
  }
  return noContent();
}
