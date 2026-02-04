"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { PokemonCard } from "@/components/PokemonCard";
import { TeamBuilder, useTeam } from "@/components/TeamBuilder";
import { TeamShare } from "@/components/TeamShare";
import { Pagination } from "@/components/Pagination";
import { fetchJSONCached } from "@/lib/cache";
import { POKE_API, PokemonListResponse, TypeIndex } from "@/lib/pokeapi";

type Mode = "all" | "type";

export default function HomeClient() {
  const [mode, setMode] = useState<Mode>("all");
  const [type, setType] = useState<string>("fire");
  const [typeIndex, setTypeIndex] = useState<TypeIndex | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(24);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [count, setCount] = useState(0);
  const [results, setResults] = useState<{ name: string; url: string }[]>([]);

  const searchParams = useSearchParams();
  const initialTeamCode = searchParams.get("team") ?? "";

  const { team, setMember, removeMember, clear } = useTeam(initialTeamCode);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [search]);

  const offset = (page - 1) * limit;

  useEffect(() => {
    fetchJSONCached<TypeIndex>("type-index", "/api/type-index")
      .then((j) => setTypeIndex(j))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setPage(1);
  }, [mode, type, limit]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setErr(null);
      try {
        if (debounced) {
          const r = await fetch(`${POKE_API}/pokemon/${debounced}`);
          if (r.status === 404) {
            if (!cancelled) {
              setCount(0);
              setResults([]);
            }
            return;
          }
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          const p = (await r.json()) as import("@/lib/pokemon-types").PokemonDetail;
          if (!cancelled) {
            setCount(1);
            setResults([{ name: p.name, url: `${POKE_API}/pokemon/${p.id}/` }]);
          }
          return;
        }

        if (mode === "all") {
          const url = `${POKE_API}/pokemon?limit=${limit}&offset=${offset}`;
          const json = await fetchJSONCached<PokemonListResponse>(
            `list:all:${limit}:${offset}`,
            url,
            undefined,
            1000 * 60 * 5
          );
          if (!cancelled) {
            setCount(json.count);
            setResults(json.results);
          }
        } else {
          const url = `/api/pokemon/type?type=${encodeURIComponent(type)}&limit=${limit}&offset=${offset}`;
          const json = await fetchJSONCached<{ count: number; results: { name: string; url: string }[] }>(
            `list:type:${type}:${limit}:${offset}`,
            url,
            undefined,
            1000 * 60 * 5
          );
          if (!cancelled) {
            setCount(json.count);
            setResults(json.results);
          }
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        if (!cancelled) setErr(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [mode, type, limit, offset, debounced]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(count / limit)), [count, limit]);

  const typeOptions = useMemo(() => {
    const keys = Object.keys(typeIndex?.types ?? {});
    return keys.length
      ? keys
      : [
          "normal",
          "fire",
          "water",
          "electric",
          "grass",
          "ice",
          "fighting",
          "poison",
          "ground",
          "flying",
          "psychic",
          "bug",
          "rock",
          "ghost",
          "dragon",
          "dark",
          "steel",
          "fairy",
        ];
  }, [typeIndex]);

  const hasData = results.length > 0;

  return (
    <main className="min-h-[calc(100vh-3.5rem)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pokédex</h1>
            <p className="text-sm text-muted-foreground">
              Browse with page numbers, filter by type, and build a 6-slot team.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name (e.g., pikachu)"
              className="sm:w-[260px]"
            />

            <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Limit" />
              </SelectTrigger>
              <SelectContent>
                {[12, 24, 48].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}/page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </header>

        <Separator className="my-6" />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <section>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
              <div className="flex gap-2 items-center flex-wrap">
                <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Pokémon</SelectItem>
                    <SelectItem value="type">By Type</SelectItem>
                  </SelectContent>
                </Select>

                {mode === "type" ? (
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((t) => (
                        <SelectItem key={t} value={t}>
                          <span className="capitalize">{t}</span>
                          {typeIndex?.types?.[t]?.total ? (
                            <span className="ml-2 text-muted-foreground">({typeIndex.types[t].total})</span>
                          ) : null}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : null}
              </div>

              <div className="text-sm text-muted-foreground">
                {debounced ? "Search result" : `${count.toLocaleString()} total`} · Page {page} / {totalPages}
              </div>
            </div>

            {err ? (
              <div className="mt-4 rounded-lg border bg-card p-4">
                <p className="text-sm font-medium text-destructive">Couldn’t load Pokémon</p>
                <p className="text-sm text-muted-foreground mt-1">{err}</p>
                <Button className="mt-3" variant="secondary" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            ) : null}

            {!err && debounced && !loading && results.length === 0 ? (
              <div className="mt-4 rounded-lg border bg-card p-4">
                <p className="text-sm font-medium">No Pokémon found</p>
                <p className="text-sm text-muted-foreground mt-1">Try a different name (e.g. “eevee”).</p>
              </div>
            ) : null}

            {!err && !loading && !debounced && !hasData ? (
              <div className="mt-4 rounded-lg border bg-card p-4">
                <p className="text-sm font-medium">Nothing to show</p>
                <p className="text-sm text-muted-foreground mt-1">Try changing the filters.</p>
              </div>
            ) : null}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
              {loading
                ? Array.from({ length: Math.min(limit, 12) }).map((_, i) => (
                    <div key={i} className="border rounded-lg p-3 bg-card">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-14 w-14 rounded" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-14 mt-2" />
                        </div>
                      </div>
                    </div>
                  ))
                : results.map((p) => (
                    <PokemonCard
                      key={p.name}
                      name={p.name}
                      url={p.url}
                      selected={team.includes(p.name)}
                      onToggleSelect={() => (team.includes(p.name) ? removeMember(p.name) : setMember(p.name))}
                    />
                  ))}
            </div>

            {!debounced && !err ? (
              <div className="mt-6 space-y-2">
                <Pagination page={page} totalPages={totalPages} onPage={setPage} />
                <div className="text-xs text-muted-foreground text-center">
                  Offset {offset} · Showing {Math.min(limit, results.length)}
                </div>
              </div>
            ) : null}
          </section>

          <aside className="lg:sticky lg:top-20 h-fit">
            <div className="space-y-4">
              <TeamBuilder team={team} removeMember={removeMember} clear={clear} />
              <TeamShare team={team} />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
