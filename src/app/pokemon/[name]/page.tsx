import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TypeBadge } from "@/components/TypeBadge";
import { EvolutionChain } from "@/components/EvolutionChain";
import { KeyValueTable } from "@/components/KeyValueTable";
import { EncounterTable } from "@/components/EncounterTable";
import { fetchEvolutionChain } from "@/lib/evolution";
import { fetchEncounters } from "@/lib/encounters";
import type { PokemonDetail } from "@/lib/pokemon-types";
import type { PokemonDetailExtra, PokemonMoveEntry } from "@/lib/pokemon-extra-types";
import type { PokemonSpecies } from "@/lib/species-types";
import { eggCycles, genderRatio, titleCase } from "@/lib/species-utils";
import MovesList from "./moves.client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
  const species = speciesRes.ok
    ? ((await speciesRes.json()) as PokemonSpecies & {
        genera?: Array<{ genus: string; language: { name: string } }>;
        flavor_text_entries?: Array<{ flavor_text: string; language: { name: string } }>;
      })
    : null;

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

  const evYield =
    p.stats
      .filter((s) => s.effort > 0)
      .map((s) => `${titleCase(s.stat.name)} +${s.effort}`)
      .join(", ") || "None";

  const trainingRows = species
    ? [
        { k: "EV yield", v: evYield },
        { k: "Catch rate", v: species.capture_rate },
        { k: "Base Friendship", v: species.base_happiness },
        { k: "Base Exp.", v: p.base_experience ?? "—" },
        { k: "Growth Rate", v: titleCase(species.growth_rate?.name ?? "—") },
      ]
    : [];

  const breedingRows = species
    ? (() => {
        const g = genderRatio(species.gender_rate);
        const egg = (species.egg_groups ?? []).map((e) => titleCase(e.name)).join(", ") || "—";
        const cycles = eggCycles(species.hatch_counter ?? 0);
        return [
          { k: "Gender", v: g.label },
          { k: "Egg Groups", v: egg },
          { k: "Egg Cycles", v: `${cycles.cycles} (${cycles.steps.toLocaleString()} steps)` },
          { k: "Habitat", v: species.habitat?.name ? titleCase(species.habitat.name) : "—" },
        ];
      })()
    : [];

  const varietyNames = (species?.varieties ?? []).map((v) => v.pokemon.name).filter(Boolean);

  const encounters = await fetchEncounters(p.id).catch(() => []);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm underline">
          ← Back to Pokédex
        </Link>
        <div className="text-sm text-muted-foreground font-mono">#{String(p.id).padStart(4, "0")}</div>
      </div>

      {/* Hero */}
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

          {varietyNames.length > 1 ? (
            <div className="mt-4 flex gap-2 flex-wrap items-center">
              <span className="text-sm text-muted-foreground">Forms:</span>
              {varietyNames.map((vn) => (
                <Link key={vn} href={`/pokemon/${vn}`} className="text-sm underline capitalize">
                  {vn.replace(/-/g, " ")}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pokédex data</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="p-4">
            <KeyValueTable
              rows={[
                { k: "Height", v: p.height ? `${p.height / 10} m` : "—" },
                { k: "Weight", v: p.weight ? `${p.weight / 10} kg` : "—" },
                { k: "Abilities", v: (p.abilities ?? []).map((a) => a.ability.name).join(", ") },
                { k: "Base experience", v: p.base_experience ?? "—" },
              ]}
            />
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Training</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="p-4">
            {species ? <KeyValueTable rows={trainingRows} /> : <p className="text-sm text-muted-foreground">No training data.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Breeding</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="p-4">
            {species ? <KeyValueTable rows={breedingRows} /> : <p className="text-sm text-muted-foreground">No breeding data.</p>}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Location</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="p-4">
          <Accordion type="single" collapsible defaultValue="encounters">
            <AccordionItem value="encounters">
              <AccordionTrigger>Encounters (game-specific)</AccordionTrigger>
              <AccordionContent>
                <EncounterTable encounters={encounters} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Evolution chain</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="p-4">
          {evo ? <EvolutionChain node={evo} /> : <p className="text-sm text-muted-foreground">No evolution data.</p>}
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
