"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { titleCase } from "@/lib/species-utils";
import type { MoveWithDetails, VersionGroupDetail } from "@/lib/moves-types";

type MoveLearnMethod = "level-up" | "machine" | "egg" | "tutor" | string;

type GroupedMoves = {
  "level-up": Array<{ name: string; level: number; version: string }>;
  machine: Array<{ name: string; version: string }>;
  egg: Array<{ name: string; version: string }>;
  tutor: Array<{ name: string; version: string }>;
  other: Array<{ name: string; version: string; method: string }>;
};

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

function dedupeBy<T>(items: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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
    const out: GroupedMoves = {
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
      const match = vg !== ALL ? details.filter((d) => d.version_group?.name === vg) : details;
      for (const d of match) {
        const method = d.move_learn_method?.name ?? "other";
        const version = d.version_group?.name ?? "unknown";

        if (method === "level-up") {
          out["level-up"].push({ name, level: d.level_learned_at ?? 0, version });
        } else if (method === "machine" || method === "egg" || method === "tutor") {
          out[method].push({ name, version });
        } else {
          out.other.push({ name, version, method });
        }
      }
    }

    out["level-up"] = dedupeBy(out["level-up"], (m) => `${m.name}@${m.level}@${m.version}`).sort(
      (a, b) => a.level - b.level || a.name.localeCompare(b.name) || a.version.localeCompare(b.version)
    );

    out.machine = dedupeBy(out.machine, (m) => `${m.name}@${m.version}`).sort(
      (a, b) => a.name.localeCompare(b.name) || a.version.localeCompare(b.version)
    );
    out.egg = dedupeBy(out.egg, (m) => `${m.name}@${m.version}`).sort(
      (a, b) => a.name.localeCompare(b.name) || a.version.localeCompare(b.version)
    );
    out.tutor = dedupeBy(out.tutor, (m) => `${m.name}@${m.version}`).sort(
      (a, b) => a.name.localeCompare(b.name) || a.version.localeCompare(b.version)
    );
    out.other = dedupeBy(out.other, (m) => `${m.name}@${m.version}@${m.method}`).sort(
      (a, b) => a.method.localeCompare(b.method) || a.name.localeCompare(b.name) || a.version.localeCompare(b.version)
    );

    return out;
  }, [moves, needle, vg]);

  const counts = {
    "level-up": grouped["level-up"].length,
    machine: grouped.machine.length,
    egg: grouped.egg.length,
    tutor: grouped.tutor.length,
    other: grouped.other.length,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter moves (e.g. tackle)"
          className="w-full lg:w-[320px]"
        />

        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground whitespace-nowrap">Version:</div>
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

      <div className="flex flex-wrap gap-2">
        {(
          ["level-up", "machine", "egg", "tutor", "other"] as Array<keyof typeof counts>
        ).map((k) => (
          <Badge key={k} variant="secondary" className="text-xs">
            {methodLabel(k)}: {counts[k]}
          </Badge>
        ))}
      </div>

      <section className="space-y-2">
        <div className="text-sm font-semibold">{methodLabel("level-up")}</div>
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[90px]">Level</TableHead>
                <TableHead>Move</TableHead>
                <TableHead className="w-[220px]">Version group</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grouped["level-up"].slice(0, 250).map((m) => (
                <TableRow key={`lvl-${m.name}-${m.level}-${m.version}`}>
                  <TableCell className="font-mono tabular-nums">{m.level}</TableCell>
                  <TableCell>
                    <Link href={`https://pokemondb.net/move/${m.name}`} target="_blank" className="capitalize hover:underline">
                      {m.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{titleCase(m.version)}</TableCell>
                </TableRow>
              ))}
              {!grouped["level-up"].length ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground">
                    No level-up moves for this filter.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </section>

      {(["machine", "egg", "tutor"] as const).map((k) => (
        <section key={k} className="space-y-2">
          <Separator />
          <div className="text-sm font-semibold">{methodLabel(k)}</div>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Move</TableHead>
                  <TableHead className="w-[220px]">Version group</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grouped[k].slice(0, 250).map((m) => (
                  <TableRow key={`${k}-${m.name}-${m.version}`}>
                    <TableCell>
                      <Link href={`https://pokemondb.net/move/${m.name}`} target="_blank" className="capitalize hover:underline">
                        {m.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{titleCase(m.version)}</TableCell>
                  </TableRow>
                ))}
                {!grouped[k].length ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-muted-foreground">
                      No {methodLabel(k).toLowerCase()} moves for this filter.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </section>
      ))}

      <section className="space-y-2">
        <Separator />
        <div className="text-sm font-semibold">{methodLabel("other")}</div>
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Move</TableHead>
                <TableHead className="w-[200px]">Method</TableHead>
                <TableHead className="w-[220px]">Version group</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grouped.other.slice(0, 250).map((m) => (
                <TableRow key={`other-${m.name}-${m.version}-${m.method}`}>
                  <TableCell>
                    <Link href={`https://pokemondb.net/move/${m.name}`} target="_blank" className="capitalize hover:underline">
                      {m.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{titleCase(m.method)}</TableCell>
                  <TableCell className="text-muted-foreground">{titleCase(m.version)}</TableCell>
                </TableRow>
              ))}
              {!grouped.other.length ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground">
                    No other moves for this filter.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
