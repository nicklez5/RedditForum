export interface VisitItemDto {
  id: number;
  kind: string;        // e.g. "r/webdev", "u/johndoe", "Route"
  title: string;       // Display title
  url: string;         // Link target
  startedAt: string;   // ISO date string
  durationMs?: number; // optional
}
export interface PageVisit {
  id: number;
  entityType: "Thread" | "Forum" | "Profile" | "Route";
  entityId?: number | null;
  path: string;        // e.g. "/thread/123" or "/forum/2" or "/profile/..."
  referrerPath?: string | null;
  startedAt: string;   // ISO string
  durationMs?: number | null;
}
const segmentName = (segment: string) =>
  segment.replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());

export function mapVisitToItem(v: PageVisit): VisitItemDto {
  // sensible defaults
  let kind = "Route";
  let title = v.path || "/";
  let url = v.path || "/";

  switch (v.entityType) {
    case "Forum": {
      // path: /forum/:id or /r/:slug
      const parts = v.path.split("/").filter(Boolean);
      // try to get a friendly label, else show r/<id>
      const label = parts[1] ? parts[1] : (v.entityId ?? "").toString();
      kind = `forum/${label}`;
      title = segmentName(label);
      url = v.path;
      break;
    }
    case "Thread": {
      // path: /thread/:id (or /r/<slug>/comments/:id if your routes are nested)
      
      kind = v.path;
      title = "Thread"; // If you have thread titles in state, use them here
      url = v.path;
      break;
    }
    case "Profile": {
      // path might be /profile/<guid> or /u/<username>
      const parts = v.path.split("/").filter(Boolean);
      const label = parts[1] ?? "user";
      kind = `u/${label}`;
      title = `Profile – ${label}`;
      url = "";
      break;
    }
    case "Route":
    default: {
      // route view (home, search, etc.)
      const friendly =
        v.path === "/" ? "Home" :
        v.path.replace(/^\//, "");
      kind = "Route";
      title = friendly || "/";
      url = v.path || "/";
      break;
    }
  }

  return {
    id: v.id,
    kind,
    title,
    url,
    startedAt: v.startedAt,
    durationMs: v.durationMs ?? undefined
  };
}
export function dedupeConsecutive(items: VisitItemDto[]) {
  const out: VisitItemDto[] = [];
  let lastUrl = "";
  for (const it of items) {
    if (it.url !== lastUrl) out.push(it);
    lastUrl = it.url;
  }
  return out;
}