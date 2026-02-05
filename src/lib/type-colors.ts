// PokemonDB-ish type palette (stronger, high-contrast)
// Note: Tailwind classes; tweak freely.

export const TYPE_COLORS: Record<string, { bg: string; fg: string; ring: string }> = {
  normal: { bg: "bg-[#A8A77A]", fg: "text-white", ring: "ring-black/10" },
  fire: { bg: "bg-[#EE8130]", fg: "text-white", ring: "ring-black/10" },
  water: { bg: "bg-[#6390F0]", fg: "text-white", ring: "ring-black/10" },
  electric: { bg: "bg-[#F7D02C]", fg: "text-black", ring: "ring-black/10" },
  grass: { bg: "bg-[#7AC74C]", fg: "text-white", ring: "ring-black/10" },
  ice: { bg: "bg-[#96D9D6]", fg: "text-black", ring: "ring-black/10" },
  fighting: { bg: "bg-[#C22E28]", fg: "text-white", ring: "ring-black/10" },
  poison: { bg: "bg-[#A33EA1]", fg: "text-white", ring: "ring-black/10" },
  ground: { bg: "bg-[#E2BF65]", fg: "text-black", ring: "ring-black/10" },
  flying: { bg: "bg-[#A98FF3]", fg: "text-black", ring: "ring-black/10" },
  psychic: { bg: "bg-[#F95587]", fg: "text-white", ring: "ring-black/10" },
  bug: { bg: "bg-[#A6B91A]", fg: "text-black", ring: "ring-black/10" },
  rock: { bg: "bg-[#B6A136]", fg: "text-black", ring: "ring-black/10" },
  ghost: { bg: "bg-[#735797]", fg: "text-white", ring: "ring-black/10" },
  dragon: { bg: "bg-[#6F35FC]", fg: "text-white", ring: "ring-black/10" },
  dark: { bg: "bg-[#705746]", fg: "text-white", ring: "ring-black/10" },
  steel: { bg: "bg-[#B7B7CE]", fg: "text-black", ring: "ring-black/10" },
  fairy: { bg: "bg-[#D685AD]", fg: "text-black", ring: "ring-black/10" },
};

export function typeClass(type: string) {
  return TYPE_COLORS[type] ?? { bg: "bg-muted", fg: "text-foreground", ring: "ring-border" };
}
