import { fetchJSON } from "@/lib/pokeapi";

export type EvolutionNode = {
  name: string;
  evolvesTo: EvolutionNode[];
};

type ChainLink = {
  species: { name: string };
  evolves_to: ChainLink[];
};

type EvolutionChainResponse = { chain: ChainLink };

export async function fetchEvolutionChain(pokemonName: string): Promise<EvolutionNode> {
  const species = await fetchJSON<{ evolution_chain: { url: string } }>(
    `https://pokeapi.co/api/v2/pokemon-species/${pokemonName}`
  );
  const chain = await fetchJSON<EvolutionChainResponse>(species.evolution_chain.url);

  function walk(node: ChainLink): EvolutionNode {
    return {
      name: node.species.name,
      evolvesTo: (node.evolves_to ?? []).map(walk),
    };
  }

  return walk(chain.chain);
}
