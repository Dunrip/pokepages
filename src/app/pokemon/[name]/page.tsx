import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TypeBadge } from "@/components/TypeBadge";
import { fetchEvolutionChain, type EvolutionNode } from "@/lib/evolution";
import type { PokemonDetail } from "@/lib/pokemon-types";
import type { PokemonDetailExtra, PokemonMoveEntry } from "@/lib/pokemon-extra-types";
import MovesList from "./moves.client";

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid grid-cols-[90px_1fr_50px] items-center gap-3">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="h-2 rounded bg-muted overflow-hidden">
        <div className="h-full bg-primary" style={{ width: `${Math.min(100, (value / 200) * 100)}%` }} />
      </div>
      <div className="text-sm font-mono text-right">{value}</div>
    </div>
  );
}

function EvolutionView({ node }: { node: EvolutionNode }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="font-medium capitalize">{node.name}</div>
      {node.evolvesTo.length ? (
        <div className="pl-4 border-l space-y-3">
          {node.evolvesTo.map((n) => (
            <EvolutionView key={n.name} node={n} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default async function PokemonPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;

  const r = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`, { next: { revalidate: 3600 } });
  if (!r.ok) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <Link href="/" className="text-sm underline">
          ← Back
        </Link>
        <p className="mt-4">Not found.</p>
      </main>
    );
  }

  const p = (await r.json()) as PokemonDetail & PokemonDetailExtra;

  const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${p.name}`, { next: { revalidate: 3600 } });
  const species = speciesRes.ok ? ((await speciesRes.json()) as {
    genera?: Array<{ genus: string; language: { name: string } }>;
    flavor_text_entries?: Array<{ flavor_text: string; language: { name: string } }>;
  }) : null;

  const genus = species?.genera?.find((g) => g.language.name === "en")?.genus;
  const flavor = species?.flavor_text_entries
    ?.find((f) => f.language.name === "en")
    ?.flavor_text?.replace(/\f|\n|\r/g, " ");

  const hp = p.stats.find((s) => s.stat.name === "hp")?.base_stat ?? 0;
  const atk = p.stats.find((s) => s.stat.name === "attack")?.base_stat ?? 0;
  const def = p.stats.find((s) => s.stat.name === "defense")?.base_stat ?? 0;
  const spa = p.stats.find((s) => s.stat.name === "special-attack")?.base_stat ?? 0;
  const spd = p.stats.find((s) => s.stat.name === "special-defense")?.base_stat ?? 0;
  const spe = p.stats.find((s) => s.stat.name === "speed")?.base_stat ?? 0;
  const total = hp + atk + def + spa + spd + spe;

  const evo = await fetchEvolutionChain(p.name).catch(() => null);

  const moves = (p.moves ?? []) as PokemonMoveEntry[];

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm underline">
          ← Back to Pokédex
        </Link>
        <div className="text-sm text-muted-foreground font-mono">#{String(p.id).padStart(4, "0")}</div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 items-start">
        <div className="rounded-xl border bg-card p-4 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.sprites.front_default ?? ""} alt={p.name} width={160} height={160} />
        </div>

        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-4xl font-bold capitalize tracking-tight">{p.name}</h1>
            {genus ? <Badge variant="secondary">{genus}</Badge> : null}
          </div>

          <div className="mt-3 flex gap-2 flex-wrap">
            {p.types.map((t) => (
              <TypeBadge key={t.type.name} type={t.type.name} />
            ))}
          </div>

          {flavor ? <p className="mt-4 text-sm text-muted-foreground max-w-2xl">{flavor}</p> : null}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pokédex data</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="p-4">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <dt className="text-sm text-muted-foreground">Height</dt>
                <dd className="text-sm font-medium">{p.height ? `${p.height / 10} m` : "—"}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Weight</dt>
                <dd className="text-sm font-medium">{p.weight ? `${p.weight / 10} kg` : "—"}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Abilities</dt>
                <dd className="text-sm font-medium">{(p.abilities ?? []).map((a) => a.ability.name).join(", ")}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Base experience</dt>
                <dd className="text-sm font-medium">{p.base_experience ?? "—"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Base stats</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="p-4 space-y-3">
            <StatRow label="HP" value={hp} />
            <StatRow label="Attack" value={atk} />
            <StatRow label="Defense" value={def} />
            <StatRow label="Sp. Atk" value={spa} />
            <StatRow label="Sp. Def" value={spd} />
            <StatRow label="Speed" value={spe} />
            <Separator className="my-2" />
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="text-sm font-mono">{total}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Evolution chain</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="p-4">
          {evo ? <EvolutionView node={evo} /> : <p className="text-sm text-muted-foreground">No evolution data.</p>}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Moves</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="p-4">
          <MovesList moves={moves} />
        </CardContent>
      </Card>
    </main>
  );
}
