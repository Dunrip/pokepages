export type PokemonMoveEntry = {
  move: { name: string; url: string };
  version_group_details: Array<{
    level_learned_at: number;
    move_learn_method: { name: string };
    version_group: { name: string };
  }>;
};

export type PokemonDetailExtra = {
  height: number;
  weight: number;
  base_experience: number;
  moves: PokemonMoveEntry[];
};
