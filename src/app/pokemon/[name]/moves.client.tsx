"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { titleCase } from "@/lib/species-utils";
import type { MoveWithDetails, VersionGroupDetail } from "@/lib/moves-types";

type MoveLearnMethod = "level-up" | "machine" | "egg" | "tutor" | string;

function methodLabel(m: MoveLearnMethod) {
  switch (m) {
    case "level-up":
      return "Level-up";
    case "machine":
      return "TM / Machine";
    case "egg":
      return "Egg";
    case "tutor":
      return "Tutor";
    default:
      return titleCase(m);
  }
}

export default function MovesList({ moves }: { moves: MoveWithDetails[] }) {
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();

  const versionGroups = useMemo(() => {
    const set = new Set<string>();
    for (const m of moves ?? []) {
      for (const vd of (m.version_group_details ?? []) as VersionGroupDetail[]) {
        if (vd?.version_group?.name) set.add(vd.version_group.name);
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [moves]);

  const ALL = "__all__";
  const [vg, setVg] = useState<string>(ALL);

  const grouped = useMemo(() => {
    const out: Record<string, Array<{ name: string; level?: number }>> = {
      "level-up": [],
      machine: [],
      egg: [],
      tutor: [],
      other: [],
    };

    for (const m of moves ?? []) {
      const name = m.move?.name;
      if (!name) continue;
      if (needle && !name.includes(needle)) continue;

      const details = m.version_group_details ?? [];
      const match = vg && vg !== ALL ? details.filter((d) => d.version_group?.name === vg) : details;
      for (const d of match) {
        const method = (d.move_learn_method?.name ?? "other") as string;
        if (method === "level-up") {
          out["level-up"].push({ name, level: d.level_learned_at ?? 0 });
        } else if (out[method]) {
          out[method].push({ name });
        } else {
          out.other.push({ name });
        }
      }
    }

    out["level-up"].sort((a, b) => (a.level ?? 0) - (b.level ?? 0) || a.name.localeCompare(b.name));

    // dedupe level-up by (name, level)
    {
      const seen = new Set<string>();
      out["level-up"] = out["level-up"].filter((x) => {
        const k = `${x.name}@${x.level ?? 0}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
    }
    for (const k of ["machine", "egg", "tutor", "other"]) {
      out[k].sort((a, b) => a.name.localeCompare(b.name));
    }

    for (const k of ["machine", "egg", "tutor", "other"]) {
      const seen = new Set<string>();
      out[k] = out[k].filter((x) => (seen.has(x.name) ? false : (seen.add(x.name), true)));
    }

    return out;
  }, [moves, needle, vg]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter moves (e.g. tackle)"
          className="sm:w-[280px]"
        />

        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground">Version:</div>
          <Select value={vg} onValueChange={setVg}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select version group" />
            </SelectTrigger>
            <SelectContent>
              {[ALL, ...versionGroups].map((v) => (
                <SelectItem key={v} value={v}>
                  {v === ALL ? "All versions" : titleCase(v)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <section>
          <div className="text-sm font-semibold">{methodLabel("level-up")}</div>
          <Separator className="my-2" />
          <div className="flex flex-wrap gap-2">
            {grouped["level-up"].slice(0, 80).map((m, idx) => (
              <Badge key={`${m.name}-${idx}`} variant="secondary" className="capitalize">
                Lv {m.level}: {m.name}
              </Badge>
            ))}
          </div>
        </section>

        {(["machine", "egg", "tutor", "other"] as const).map((k) => (
          <section key={k}>
            <div className="text-sm font-semibold">{methodLabel(k)}</div>
            <Separator className="my-2" />
            <div className="flex flex-wrap gap-2">
              {grouped[k].slice(0, 120).map((m) => (
                <Badge key={`${k}-${m.name}`} variant="secondary" className="capitalize">
                  {m.name}
                </Badge>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
