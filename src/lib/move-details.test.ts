import { afterEach, describe, expect, it, vi } from "vitest";
import type { MoveWithDetails } from "@/lib/moves-types";
import { enrichMovesWithMeta } from "@/lib/move-details";

const makeMove = (name: string, url?: string): MoveWithDetails => ({
  move: {
    name,
    url,
  },
  version_group_details: [],
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("enrichMovesWithMeta", () => {
  it("dedupes duplicate move URLs and fetches each unique move detail once", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => ({
          power: 50,
          accuracy: 100,
          pp: 35,
          type: { name: "normal" },
          damage_class: { name: "physical" },
        }),
      } as Response);

    vi.stubGlobal("fetch", fetchMock);

    const sharedUrl = "https://pokeapi.co/api/v2/move/33/";
    const moves = [
      makeMove("tackle", sharedUrl),
      makeMove("quick-attack", sharedUrl),
      makeMove("scratch", "https://pokeapi.co/api/v2/move/10/"),
    ];

    const enriched = await enrichMovesWithMeta(moves);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledWith(sharedUrl, { next: { revalidate: 3600 } });

    expect(enriched[0].meta).toEqual({
      power: 50,
      accuracy: 100,
      pp: 35,
      type: "normal",
      category: "physical",
    });
    expect(enriched[1].meta).toEqual(enriched[0].meta);
  });

  it("returns EMPTY_META fields when a move detail request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network fail")));

    const moves = [makeMove("bad-move", "https://pokeapi.co/api/v2/move/99999/")];
    const enriched = await enrichMovesWithMeta(moves);

    expect(enriched[0].meta).toEqual({
      power: null,
      accuracy: null,
      pp: null,
      type: null,
      category: null,
    });
  });

  it("continues enriching all moves when only some detail requests fail", async () => {
    const goodUrl = "https://pokeapi.co/api/v2/move/53/";
    const badUrl = "https://pokeapi.co/api/v2/move/404404/";

    const fetchMock = vi.fn(async (url: string) => {
      if (url === badUrl) {
        throw new Error("fetch failed");
      }

      return {
        ok: true,
        json: async () => ({
          power: 90,
          accuracy: 100,
          pp: 15,
          type: { name: "fire" },
          damage_class: { name: "special" },
        }),
      } as Response;
    });

    vi.stubGlobal("fetch", fetchMock);

    const moves = [makeMove("flamethrower", goodUrl), makeMove("missing-move", badUrl)];

    const enriched = await enrichMovesWithMeta(moves);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(enriched).toEqual([
      expect.objectContaining({
        move: expect.objectContaining({ name: "flamethrower", url: goodUrl }),
        meta: {
          power: 90,
          accuracy: 100,
          pp: 15,
          type: "fire",
          category: "special",
        },
      }),
      expect.objectContaining({
        move: expect.objectContaining({ name: "missing-move", url: badUrl }),
        meta: {
          power: null,
          accuracy: null,
          pp: null,
          type: null,
          category: null,
        },
      }),
    ]);
  });
});
