"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Pagination } from "@/components/Pagination";
import { PokedexTable, SortKey } from "@/components/PokedexTable";
import { loadPokedexIndex } from "@/lib/pokedex-index";
import { useTeam } from "@/components/TeamBuilder";

export type PokemonRow = {
  id: number;
  name: string;
  sprite: string | null;
  types: string[];
  stats: {
    total: number;
    hp: number;
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
  };
};

function compare(a: PokemonRow, b: PokemonRow, key: SortKey): number {
  switch (key) {
    case "id":
      return a.id - b.id;
    case "name":
      return a.name.localeCompare(b.name);
    case "type":
      return (a.types[0] ?? "").localeCompare(b.types[0] ?? "");
    case "total":
      return a.stats.total - b.stats.total;
    case "hp":
      return a.stats.hp - b.stats.hp;
    case "atk":
      return a.stats.atk - b.stats.atk;
    case "def":
      return a.stats.def - b.stats.def;
    case "spa":
      return a.stats.spa - b.stats.spa;
    case "spd":
      return a.stats.spd - b.stats.spd;
    case "spe":
      return a.stats.spe - b.stats.spe;
    default:
      return 0;
  }
}

export default function HomeClient() {
  const [index, setIndex] = useState<PokemonRow[] | null>(null);
  const [indexErr, setIndexErr] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);

  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  const [type, setType] = useState<string>("__all");

  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const searchParams = useSearchParams();
  const initialTeamCode = searchParams.get("team") ?? "";
  const { team, setMember, removeMember } = useTeam(initialTeamCode);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [search]);

  // keyboard shortcut: / focuses search
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "/") return;
      const t = e.target as HTMLElement | null;
      const isTyping = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (isTyping) return;
      e.preventDefault();
      const el = document.getElementById("pokedex-search") as HTMLInputElement | null;
      el?.focus();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadPokedexIndex()
      .then((j) => {
        if (!cancelled) setIndex(j.items);
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : "Failed to load pokedex index";
        if (!cancelled) setIndexErr(msg);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const typeOptions = useMemo(() => {
    if (!index) return [] as string[];
    const set = new Set<string>();
    for (const p of index) for (const t of p.types) set.add(t);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [index]);

  const filtered = useMemo(() => {
    if (!index) return [] as PokemonRow[];
    let out = index;

    if (type !== "__all") {
      out = out.filter((p) => p.types.includes(type));
    }
    if (debounced) {
      out = out.filter((p) => p.name.includes(debounced));
    }
    return out;
  }, [index, type, debounced]);

  const sorted = useMemo(() => {
    const out = [...filtered];
    out.sort((a, b) => compare(a, b, sortKey));
    if (sortDir === "desc") out.reverse();
    return out;
  }, [filtered, sortKey, sortDir]);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const effectivePage = page > totalPages ? 1 : page;

  const start = (effectivePage - 1) * limit;
  const pageRows = sorted.slice(start, start + limit);

  function onSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <main className="min-h-[calc(100vh-3.5rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <header className="sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex flex-col items-center gap-3">
          <div className="w-full flex items-center justify-between">
            <div className="w-[140px]" />
            <h1 className="text-3xl font-bold tracking-tight text-center flex-1">Pokédex</h1>
            <div className="w-[140px] flex justify-end">
              <Link href="/team" className="text-sm underline">
                Team ({team.length}/6)
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 rounded-xl border bg-card px-4 py-3 w-full max-w-3xl">
            <div className="flex items-center gap-2 w-full sm:flex-1">
              <div className="text-sm text-muted-foreground w-12 text-right">Name:</div>
              <Input id="pokedex-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="e.g. pikachu" />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="text-sm text-muted-foreground w-12 text-right">Type:</div>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">- All -</SelectItem>
                  {typeOptions.map((t) => (
                    <SelectItem key={t} value={t}>
                      <span className="capitalize">{t}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">Per page:</div>
              <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[25, 50, 100].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            {index ? `${total.toLocaleString()} found` : "Loading…"} · Page {effectivePage} / {totalPages}
          </div>
                </div>
      </header>

        <Separator className="my-6" />

        {indexErr ? (
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm font-medium text-destructive">Couldn’t load index</p>
            <p className="text-sm text-muted-foreground mt-1">{indexErr}</p>
            <Button className="mt-3" variant="secondary" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        ) : null}

        {!index && !indexErr ? (
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-12 rounded-lg border bg-card">
                <Skeleton className="h-full w-full" />
              </div>
            ))}
          </div>
        ) : null}

        {index && !indexErr ? (
          <PokedexTable
            rows={pageRows}
            team={team}
            onToggleTeam={(name) => (team.includes(name) ? removeMember(name) : setMember(name))}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={onSort}
          />
        ) : null}

        {index && !indexErr ? (
          <div className="mt-6 space-y-2">
            <Pagination page={effectivePage} totalPages={totalPages} onPage={(p) => setPage(p)} />
            <div className="text-xs text-muted-foreground text-center">
              Showing {Math.min(limit, pageRows.length)} of {total.toLocaleString()}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
