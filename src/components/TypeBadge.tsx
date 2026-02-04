import { cn } from "@/lib/utils";
import { typeClass } from "@/lib/type-colors";

export function TypeBadge({ type }: { type: string }) {
  const c = typeClass(type);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1",
        c.bg,
        c.fg,
        c.ring
      )}
    >
      <span className="capitalize">{type}</span>
    </span>
  );
}
