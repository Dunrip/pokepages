import { NextResponse } from "next/server";
import { fetchJSON, POKE_API, TypeIndex } from "@/lib/pokeapi";

// Builds an index of type -> total pokemon count.
// NOTE: The full list for a type can be huge; this endpoint only returns counts.

export async function GET() {
  const typesList = await fetchJSON<{ results: { name: string; url: string }[] }>(
    `${POKE_API}/type`
  );

  const entries = await Promise.all(
    typesList.results
      // filter out special types that aren't standard pokemon types
      .filter((t) => !["unknown", "shadow"].includes(t.name))
      .map(async (t) => {
        const typeDetail = await fetchJSON<{ pokemon: { pokemon: { name: string; url: string } }[] }>(t.url);
        return [t.name, { total: typeDetail.pokemon.length }] as const;
      })
  );

  const index: TypeIndex = {
    generatedAt: new Date().toISOString(),
    types: Object.fromEntries(entries),
  };

  return NextResponse.json(index, {
    headers: {
      // cache in CDN/server for a while; this doesn't change often
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
