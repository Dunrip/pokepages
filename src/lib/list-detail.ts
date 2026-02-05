import { fetchJSONCached } from "@/lib/cache";
import { POKE_API, getIdFromPokemonUrl } from "@/lib/pokeapi";

export type PokemonListItem = { name: string; url: string };

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
  url: string;
};

function statValue(detail: import("@/lib/pokemon-types").PokemonDetail, stat: string): number {
  return detail.stats?.find((s) => s.stat.name === stat)?.base_stat ?? 0;
}

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

      const hp = statValue(detail, "hp");
      const atk = statValue(detail, "attack");
      const def = statValue(detail, "defense");
      const spa = statValue(detail, "special-attack");
      const spd = statValue(detail, "special-defense");
      const spe = statValue(detail, "speed");
      const total = hp + atk + def + spa + spd + spe;

      return {
        id: detail.id || id,
        name: detail.name,
        sprite: detail.sprites.front_default,
        types: (detail.types ?? []).map((t) => t.type.name),
        stats: { total, hp, atk, def, spa, spd, spe },
        url: it.url,
      } satisfies PokemonRow;
    })
  );

  return rows.sort((a, b) => a.id - b.id);
}
