import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function range(start: number, end: number) {
  const out: number[] = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
}

function buildPages(page: number, total: number) {
  if (total <= 1) return [1];

  const siblings = 1;
  const edges = 1;

  const left = Math.max(1 + edges, page - siblings);
  const right = Math.min(total - edges, page + siblings);

  const pages: (number | "…")[] = [];

  // left edge
  pages.push(...range(1, Math.min(edges, total)));

  if (left > edges + 1) pages.push("…");

  pages.push(...range(left, right));

  if (right < total - edges) pages.push("…");

  // right edge
  const startRight = Math.max(total - edges + 1, edges + 1);
  if (startRight <= total) pages.push(...range(startRight, total));

  // de-dup consecutive
  const dedup: (number | "…")[] = [];
  for (const p of pages) {
    if (dedup.length && dedup[dedup.length - 1] === p) continue;
    dedup.push(p);
  }
  return dedup;
}

export function Pagination({
  page,
  totalPages,
  onPage,
  className,
}: {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
  className?: string;
}) {
  const items = buildPages(page, totalPages);

  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <Button variant="secondary" disabled={page <= 1} onClick={() => onPage(Math.max(1, page - 1))}>
        Prev
      </Button>

      <div className="flex items-center gap-1 flex-wrap justify-center">
        {items.map((it, idx) =>
          it === "…" ? (
            <span key={`dots-${idx}`} className="px-2 text-sm text-muted-foreground">
              …
            </span>
          ) : (
            <Button
              key={it}
              variant={it === page ? "default" : "ghost"}
              size="sm"
              onClick={() => onPage(it)}
              className="min-w-9"
            >
              {it}
            </Button>
          )
        )}
      </div>

      <Button
        variant="secondary"
        disabled={page >= totalPages}
        onClick={() => onPage(Math.min(totalPages, page + 1))}
      >
        Next
      </Button>
    </div>
  );
}
