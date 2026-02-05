import { fetchJSONCached } from "@/lib/cache";
import { POKE_API, getIdFromPokemonUrl } from "@/lib/pokeapi";

export type PokemonListItem = { name: string; url: string };

export type PokemonRow = {
  id: number;
  name: string;
  sprite: string | null;
  types: string[];
  url: string;
};

export async function hydrateRows(items: PokemonListItem[]): Promise<PokemonRow[]> {
  const rows = await Promise.all(
    items.map(async (it) => {
      const id = getIdFromPokemonUrl(it.url) ?? 0;
      const detail = await fetchJSONCached<import("@/lib/pokemon-types").PokemonDetail>(
        `detail:${it.name}`,
        `${POKE_API}/pokemon/${it.name}`,
        undefined,
        1000 * 60 * 60
      );
      return {
        id: detail.id || id,
        name: detail.name,
        sprite: detail.sprites.front_default,
        types: (detail.types ?? []).map((t) => t.type.name),
        url: it.url,
      } satisfies PokemonRow;
    })
  );

  return rows.sort((a, b) => a.id - b.id);
}
