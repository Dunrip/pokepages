import { cache } from "react";
import type { MoveMeta, MoveWithDetails } from "@/lib/moves-types";

const EMPTY_META: MoveMeta = {
  power: null,
  accuracy: null,
  pp: null,
  type: null,
  category: null,
};

type MoveApiResponse = {
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  type?: { name?: string | null } | null;
  damage_class?: { name?: string | null } | null;
};

const fetchMoveMeta = cache(async (url: string): Promise<MoveMeta> => {
  const r = await fetch(url, { next: { revalidate: 3600 } });
  if (!r.ok) return EMPTY_META;
  const data = (await r.json()) as MoveApiResponse;
  return {
    power: data.power ?? null,
    accuracy: data.accuracy ?? null,
    pp: data.pp ?? null,
    type: data.type?.name ?? null,
    category: data.damage_class?.name ?? null,
  };
});

export async function enrichMovesWithMeta(moves: MoveWithDetails[]): Promise<MoveWithDetails[]> {
  const uniqueUrls = Array.from(new Set(moves.map((m) => m.move?.url).filter(Boolean) as string[]));

  const metaByUrl = new Map<string, MoveMeta>();
  await Promise.all(
    uniqueUrls.map(async (url) => {
      const meta = await fetchMoveMeta(url);
      metaByUrl.set(url, meta);
    })
  );

  return moves.map((m) => {
    const url = m.move?.url;
    return {
      ...m,
      meta: (url && metaByUrl.get(url)) || EMPTY_META,
    };
  });
}
