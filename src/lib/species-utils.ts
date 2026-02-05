export function genderRatio(genderRate: number): { label: string; malePct?: number; femalePct?: number } {
  if (genderRate === -1) return { label: "Genderless" };
  const female = (genderRate / 8) * 100;
  const male = 100 - female;
  return { label: `${male.toFixed(1)}% male, ${female.toFixed(1)}% female`, malePct: male, femalePct: female };
}

export function eggCycles(hatchCounter: number): { cycles: number; steps: number } {
  const cycles = hatchCounter + 1;
  const steps = 255 * cycles;
  return { cycles, steps };
}

export function titleCase(s: string) {
  return s
    .split(/[-_\s]+/g)
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}
