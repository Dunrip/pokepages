export const POKE_API = "https://pokeapi.co/api/v2";

export type NamedAPIResource = { name: string; url: string };

export type PokemonListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedAPIResource[];
};

export type TypeIndex = {
  generatedAt: string;
  // metadata per type (count of pokemon for that type)
  types: Record<string, { total: number }>;
};

export function getIdFromPokemonUrl(url: string): number | null {
  const m = url.match(/\/pokemon\/(\d+)\/?$/) || url.match(/\/pokemon\/(\d+)\//);
  return m ? Number(m[1]) : null;
}

export function spriteUrl(id: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

export async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json() as Promise<T>;
}
