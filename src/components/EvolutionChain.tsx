import Link from "next/link";
import { TypeBadge } from "@/components/TypeBadge";
import { fetchJSONCached } from "@/lib/cache";

type EvoNode = import("@/lib/evolution").EvolutionNode;

type EvoCard = {
  name: string;
  id: number;
  sprite: string | null;
  types: string[];
};

async function getCard(name: string): Promise<EvoCard> {
  const p = await fetchJSONCached<import("@/lib/pokemon-types").PokemonDetail & { sprites: { front_default: string | null } }>(
    `detail:${name}`,
    `https://pokeapi.co/api/v2/pokemon/${name}`,
    undefined,
    1000 * 60 * 60
  );
  return {
    name: p.name,
    id: p.id,
    sprite: p.sprites.front_default,
    types: (p.types ?? []).map((t) => t.type.name),
  };
}

async function flatten(node: EvoNode): Promise<EvoCard[][]> {
  // produce lanes for simple chains; if branching, show each branch as a lane
  const root = await getCard(node.name);
  if (!node.evolvesTo.length) return [[root]];

  const lanes: EvoCard[][] = [];
  for (const child of node.evolvesTo) {
    const childLanes = await flatten(child);
    for (const lane of childLanes) {
      lanes.push([root, ...lane]);
    }
  }
  return lanes;
}

export async function EvolutionChain({ node }: { node: EvoNode }) {
  const lanes = await flatten(node);

  return (
    <div className="space-y-4">
      {lanes.map((lane, idx) => (
        <div key={idx} className="flex items-center gap-3 flex-wrap">
          {lane.map((p, i) => (
            <div key={p.name} className="flex items-center gap-3">
              <div className="rounded-lg border bg-card px-3 py-2 flex items-center gap-3">
                {p.sprite ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.sprite} alt={p.name} width={56} height={56} />
                ) : null}
                <div>
                  <div className="text-xs text-muted-foreground font-mono">#{String(p.id).padStart(4, "0")}</div>
                  <Link href={`/pokemon/${p.name}`} className="font-medium capitalize hover:underline">
                    {p.name}
                  </Link>
                  <div className="mt-1 flex gap-1 flex-wrap">
                    {p.types.map((t) => (
                      <TypeBadge key={t} type={t} />
                    ))}
                  </div>
                </div>
              </div>
              {i < lane.length - 1 ? <div className="text-muted-foreground">→</div> : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
