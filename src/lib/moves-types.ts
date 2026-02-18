export type VersionGroupDetail = {
  level_learned_at: number;
  move_learn_method: { name: string };
  version_group: { name: string };
};

export type MoveMeta = {
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  type: string | null;
  category: string | null;
};

export type MoveWithDetails = {
  move: { name: string; url: string };
  version_group_details: VersionGroupDetail[];
  meta?: MoveMeta;
};
