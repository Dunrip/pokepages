import { NextRequest, NextResponse } from "next/server";
import { fetchJSON, POKE_API } from "@/lib/pokeapi";

// Server-side type pagination.
// Query: ?type=fire&limit=24&offset=0
// Returns: { count, results: [{name,url}] }

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = (searchParams.get("type") || "").toLowerCase();
  const limit = Number(searchParams.get("limit") || 24);
  const offset = Number(searchParams.get("offset") || 0);

  if (!type) {
    return NextResponse.json({ error: "Missing type" }, { status: 400 });
  }

  const typeDetail = await fetchJSON<{ pokemon: { pokemon: { name: string; url: string } }[] }>(
    `${POKE_API}/type/${type}`
  );

  const all = typeDetail.pokemon.map((p) => p.pokemon);
  const slice = all.slice(offset, offset + limit);

  return NextResponse.json(
    {
      count: all.length,
      results: slice,
      nextOffset: offset + limit < all.length ? offset + limit : null,
      prevOffset: offset - limit >= 0 ? offset - limit : null,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
