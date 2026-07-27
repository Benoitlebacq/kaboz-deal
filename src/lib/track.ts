/**
 * Envoi best-effort d'un événement d'audience vers /api/track.
 * `sendBeacon` si dispo (survit à la navigation), sinon fetch keepalive.
 * Sans cookie ni donnée perso.
 */
export function track(payload: {
  type: "view" | "search";
  path?: string;
  q?: string;
}) {
  try {
    const body = JSON.stringify(payload);
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/track",
        new Blob([body], { type: "application/json" }),
      );
    } else {
      void fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      });
    }
  } catch {
    // best-effort : on ignore
  }
}
