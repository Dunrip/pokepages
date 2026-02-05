export type PokemonSpecies = {
  capture_rate: number;
  base_happiness: number;
  growth_rate: { name: string };
  gender_rate: number; // -1, 0..8
  egg_groups: { name: string }[];
  hatch_counter: number;
  habitat: { name: string } | null;
  varieties: { is_default: boolean; pokemon: { name: string; url: string } }[];
};
