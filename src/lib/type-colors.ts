export const TYPE_COLORS: Record<string, { bg: string; fg: string; ring: string }> = {
  normal: { bg: "bg-zinc-100", fg: "text-zinc-800", ring: "ring-zinc-300" },
  fire: { bg: "bg-orange-100", fg: "text-orange-900", ring: "ring-orange-300" },
  water: { bg: "bg-sky-100", fg: "text-sky-900", ring: "ring-sky-300" },
  electric: { bg: "bg-yellow-100", fg: "text-yellow-900", ring: "ring-yellow-300" },
  grass: { bg: "bg-green-100", fg: "text-green-900", ring: "ring-green-300" },
  ice: { bg: "bg-cyan-100", fg: "text-cyan-900", ring: "ring-cyan-300" },
  fighting: { bg: "bg-red-100", fg: "text-red-900", ring: "ring-red-300" },
  poison: { bg: "bg-purple-100", fg: "text-purple-900", ring: "ring-purple-300" },
  ground: { bg: "bg-amber-100", fg: "text-amber-900", ring: "ring-amber-300" },
  flying: { bg: "bg-indigo-100", fg: "text-indigo-900", ring: "ring-indigo-300" },
  psychic: { bg: "bg-pink-100", fg: "text-pink-900", ring: "ring-pink-300" },
  bug: { bg: "bg-lime-100", fg: "text-lime-900", ring: "ring-lime-300" },
  rock: { bg: "bg-stone-100", fg: "text-stone-900", ring: "ring-stone-300" },
  ghost: { bg: "bg-violet-100", fg: "text-violet-900", ring: "ring-violet-300" },
  dragon: { bg: "bg-blue-100", fg: "text-blue-900", ring: "ring-blue-300" },
  dark: { bg: "bg-neutral-200", fg: "text-neutral-900", ring: "ring-neutral-400" },
  steel: { bg: "bg-slate-100", fg: "text-slate-900", ring: "ring-slate-300" },
  fairy: { bg: "bg-rose-100", fg: "text-rose-900", ring: "ring-rose-300" },
};

export function typeClass(type: string) {
  return TYPE_COLORS[type] ?? { bg: "bg-muted", fg: "text-foreground", ring: "ring-border" };
}
