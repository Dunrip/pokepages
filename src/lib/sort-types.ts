import type { SortKey } from "@/components/PokedexTable";

export type SortSpec = {
  key: SortKey;
  dir: "asc" | "desc";
};
