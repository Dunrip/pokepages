"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { PokemonMoveEntry } from "@/lib/pokemon-extra-types";

export default function MovesList({ moves }: { moves: PokemonMoveEntry[] }) {
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();

  const list = useMemo(() => {
    const base = (moves ?? []).map((m) => m.move?.name).filter(Boolean);
    const filtered = needle ? base.filter((n) => String(n).includes(needle)) : base;
    return filtered.slice(0, 200);
  }, [moves, needle]);

  return (
    <div className="space-y-3">
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter moves (e.g. tackle)" />
      <div className="text-xs text-muted-foreground">
        Showing {list.length} / {(moves ?? []).length} (capped at 200 for sanity)
      </div>
      <div className="flex flex-wrap gap-2">
        {list.map((m) => (
          <Badge key={m} variant="secondary" className="capitalize">
            {m}
          </Badge>
        ))}
      </div>
    </div>
  );
}
