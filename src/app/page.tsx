"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { PokemonCard } from "@/components/PokemonCard";
import { TeamBuilder, useTeam } from "@/components/TeamBuilder";
import { fetchJSON, POKE_API, PokemonListResponse, TypeIndex } from "@/lib/pokeapi";

type Mode = "all" | "type";

export default function Home() {
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

  const { team, setMember, removeMember, clear } = useTeam();

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [search]);

  const offset = (page - 1) * limit;

  // Load type index once (for counts + types list)
  useEffect(() => {
    fetch("/api/type-index")
      .then((r) => r.json())
      .then((j) => setTypeIndex(j))
      .catch(() => {});
  }, []);

  // Reset page when mode/type/limit changes
  useEffect(() => {
    setPage(1);
  }, [mode, type, limit]);

  // Main fetch
  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setErr(null);
      try {
        // Search overrides pagination (single pokemon)
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
          const json = await fetchJSON<PokemonListResponse>(
            `${POKE_API}/pokemon?limit=${limit}&offset=${offset}`
          );
          if (!cancelled) {
            setCount(json.count);
            setResults(json.results);
          }
        } else {
          const json = await fetchJSON<{ count: number; results: { name: string; url: string }[] }>(
            `/api/pokemon/type?type=${encodeURIComponent(type)}&limit=${limit}&offset=${offset}`
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
    return keys.length ? keys : [
      "normal","fire","water","electric","grass","ice","fighting","poison","ground","flying","psychic","bug","rock","ghost","dragon","dark","steel","fairy",
    ];
  }, [typeIndex]);

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto p-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">PokePages</h1>
            <p className="text-sm text-muted-foreground">
              Pokédex browsing with real pagination, global type filtering, and a 6-slot team builder.
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
              <div className="flex gap-2 items-center">
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

            {err ? <p className="mt-4 text-sm text-destructive">Error: {err}</p> : null}
            {!err && debounced && !loading && results.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">No Pokémon found.</p>
            ) : null}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
              {loading
                ? Array.from({ length: limit }).slice(0, 12).map((_, i) => (
                    <div key={i} className="border rounded-lg p-3">
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

            {/* Pagination */}
            {!debounced ? (
              <div className="flex items-center justify-between mt-6">
                <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  Prev
                </Button>
                <div className="text-sm text-muted-foreground">
                  Offset {offset} · Showing {Math.min(limit, results.length)}
                </div>
                <Button
                  variant="secondary"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            ) : null}
          </section>

          <aside className="lg:sticky lg:top-6 h-fit">
            <TeamBuilder team={team} removeMember={removeMember} clear={clear} />
          </aside>
        </div>
      </div>
    </main>
  );
}
