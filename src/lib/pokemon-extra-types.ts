export type PokemonMoveEntry = {
  move: { name: string; url: string };
};

export type PokemonDetailExtra = {
  height: number;
  weight: number;
  base_experience: number;
  moves: PokemonMoveEntry[];
};
