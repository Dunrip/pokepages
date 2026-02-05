import type { PokemonRow } from "@/lib/list-detail";

export type PokedexIndex = {
  generatedAt: string;
  count: number;
  items: Array<{
    id: number;
    name: string;
    sprite: string | null;
    types: string[];
    stats: PokemonRow["stats"];
  }>;
};

export async function loadPokedexIndex(): Promise<PokedexIndex> {
  const res = await fetch("/pokedex-index.json");
  if (!res.ok) throw new Error(`Failed to load index: HTTP ${res.status}`);
  return (await res.json()) as PokedexIndex;
}
