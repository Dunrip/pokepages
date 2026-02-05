import { cn } from "@/lib/utils";
import { typeClass } from "@/lib/type-colors";

// PokemonDB-style: bold, compact, uppercase pill
export function TypeBadge({ type }: { type: string }) {
  const c = typeClass(type);
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md px-2 py-1 text-[11px] font-semibold tracking-wide uppercase ring-1",
        c.bg,
        c.fg,
        c.ring
      )}
      style={{ minWidth: 56 }}
    >
      {type}
    </span>
  );
}
