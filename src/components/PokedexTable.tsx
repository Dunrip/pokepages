import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TypeBadge } from "@/components/TypeBadge";

type PokemonRow = {
  id: number;
  name: string;
  sprite: string | null;
  types: string[];
  stats: {
    total: number;
    hp: number;
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
  };
};

export type SortKey =
  | "id"
  | "name"
  | "type"
  | "total"
  | "hp"
  | "atk"
  | "def"
  | "spa"
  | "spd"
  | "spe";

function SortIcon({ dir }: { dir: "asc" | "desc" | null }) {
  return (
    <span className="ml-1 inline-flex flex-col leading-[8px] text-[10px] text-muted-foreground">
      <span className={dir === "asc" ? "text-foreground" : ""}>▲</span>
      <span className={dir === "desc" ? "text-foreground" : ""}>▼</span>
    </span>
  );
}

function SortTh({
  label,
  active,
  dir,
  onClick,
  className,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}) {
  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={onClick}
        className={
          "inline-flex items-center font-semibold hover:underline underline-offset-4 " +
          (active ? "text-foreground" : "text-muted-foreground")
        }
        title="Click to sort. Shift-click to set secondary sort."
      >
        {label}
        <SortIcon dir={active ? dir : null} />
      </button>
    </TableHead>
  );
}

export function PokedexTable({
  rows,
  team,
  onToggleTeam,
  sortKey,
  sortDir,
  onSort,
  onResetSort,
}: {
  rows: PokemonRow[];
  team: string[];
  onToggleTeam: (name: string) => void;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onSort: (key: SortKey, e?: { shiftKey?: boolean }) => void;
  onResetSort?: () => void;
}) {
  return (
    <div className="rounded-xl border bg-card overflow-x-auto">
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/40">
        <div className="text-xs text-muted-foreground">
          Sort: <span className="font-medium text-foreground">{sortKey}</span> ({sortDir})
          <span className="ml-2">· Shift-click adds secondary sort</span>
        </div>
        {onResetSort ? (
          <Button size="sm" variant="ghost" onClick={onResetSort}>
            Reset sort
          </Button>
        ) : null}
      </div>

      <Table>
        <TableHeader className="sticky top-0 z-20 bg-muted/80 backdrop-blur supports-[backdrop-filter]:bg-muted/60 border-b">
          <TableRow className="h-11">
            <SortTh label="#" active={sortKey === "id"} dir={sortDir} onClick={(e) => onSort("id", e)} className="w-[88px]" />
            <TableHead className="w-[64px]"></TableHead>
            <SortTh label="Name" active={sortKey === "name"} dir={sortDir} onClick={(e) => onSort("name", e)} className="min-w-[220px]" />
            <SortTh label="Type" active={sortKey === "type"} dir={sortDir} onClick={(e) => onSort("type", e)} className="min-w-[180px]" />
            <SortTh label="Total" active={sortKey === "total"} dir={sortDir} onClick={(e) => onSort("total", e)} className="text-right" />
            <SortTh label="HP" active={sortKey === "hp"} dir={sortDir} onClick={(e) => onSort("hp", e)} className="text-right" />
            <SortTh label="Atk" active={sortKey === "atk"} dir={sortDir} onClick={(e) => onSort("atk", e)} className="text-right" />
            <SortTh label="Def" active={sortKey === "def"} dir={sortDir} onClick={(e) => onSort("def", e)} className="text-right" />
            <SortTh label="SpA" active={sortKey === "spa"} dir={sortDir} onClick={(e) => onSort("spa", e)} className="text-right" />
            <SortTh label="SpD" active={sortKey === "spd"} dir={sortDir} onClick={(e) => onSort("spd", e)} className="text-right" />
            <SortTh label="Spe" active={sortKey === "spe"} dir={sortDir} onClick={(e) => onSort("spe", e)} className="text-right" />
            <TableHead className="w-[56px]"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((p) => {
            const selected = team.includes(p.name);
            return (
              <TableRow key={p.name} className="h-12 odd:bg-background even:bg-muted/10 hover:bg-muted/30">
                <TableCell className="font-mono tabular-nums text-muted-foreground whitespace-nowrap">
                  {String(p.id).padStart(4, "0")}
                </TableCell>

                <TableCell>
                  {p.sprite ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.sprite} alt={p.name} width={48} height={48} className="shrink-0" />
                  ) : null}
                </TableCell>

                <TableCell className="min-w-[220px]">
                  <Link href={`/pokemon/${p.name}`} className="font-medium capitalize hover:underline inline-block">
                    {p.name}
                  </Link>
                </TableCell>

                <TableCell className="min-w-[180px]">
                  <div className="flex gap-2 flex-wrap">
                    {p.types.map((t) => (
                      <TypeBadge key={t} type={t} />
                    ))}
                  </div>
                </TableCell>

                <TableCell className="text-right font-mono tabular-nums">{p.stats.total}</TableCell>
                <TableCell className="text-right font-mono tabular-nums">{p.stats.hp}</TableCell>
                <TableCell className="text-right font-mono tabular-nums">{p.stats.atk}</TableCell>
                <TableCell className="text-right font-mono tabular-nums">{p.stats.def}</TableCell>
                <TableCell className="text-right font-mono tabular-nums">{p.stats.spa}</TableCell>
                <TableCell className="text-right font-mono tabular-nums">{p.stats.spd}</TableCell>
                <TableCell className="text-right font-mono tabular-nums">{p.stats.spe}</TableCell>

                <TableCell className="text-right">
                  <Button
                    size="icon"
                    variant={selected ? "default" : "secondary"}
                    className="h-8 w-8 rounded-full"
                    title={selected ? "Remove from team" : "Add to team"}
                    onClick={() => onToggleTeam(p.name)}
                  >
                    {selected ? "−" : "+"}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
