import { fetchJSON } from "@/lib/pokeapi";

export type EncounterLocation = {
  location_area: { name: string; url: string };
  version_details: Array<{
    version: { name: string };
    encounter_details: Array<{
      chance: number;
      max_level: number;
      min_level: number;
      method: { name: string };
    }>;
  }>;
};

export async function fetchEncounters(pokemonId: number): Promise<EncounterLocation[]> {
  return fetchJSON<EncounterLocation[]>(`https://pokeapi.co/api/v2/pokemon/${pokemonId}/encounters`);
}
