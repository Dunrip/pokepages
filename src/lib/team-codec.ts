// Team share codec: encode up to 6 pokemon names into a URL-safe string.
// Format: comma-joined names (lowercased), then base64url.

export function encodeTeam(team: string[]): string {
  const cleaned = team
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 6);
  const raw = cleaned.join(",");
  if (!raw) return "";
  const b64 = Buffer.from(raw, "utf8").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function decodeTeam(code: string): string[] {
  try {
    if (!code) return [];
    const pad = code.length % 4 === 0 ? "" : "=".repeat(4 - (code.length % 4));
    const b64 = code.replace(/-/g, "+").replace(/_/g, "/") + pad;
    const raw = Buffer.from(b64, "base64").toString("utf8");
    return raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 6);
  } catch {
    return [];
  }
}
