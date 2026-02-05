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
import type { PokemonRow } from "@/lib/list-detail";

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
  onClick: () => void;
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
}: {
  rows: PokemonRow[];
  team: string[];
  onToggleTeam: (name: string) => void;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onSort: (key: SortKey) => void;
}) {
  return (
    <div className="rounded-xl border bg-card overflow-x-auto">
      <Table>
        <TableHeader className="sticky top-0 z-20 bg-muted/80 backdrop-blur supports-[backdrop-filter]:bg-muted/60 border-b">
          <TableRow className="h-11">
            <SortTh label="#" active={sortKey === "id"} dir={sortDir} onClick={() => onSort("id")} className="w-[76px]" />
            <TableHead className="w-[56px]"></TableHead>
            <SortTh label="Name" active={sortKey === "name"} dir={sortDir} onClick={() => onSort("name")} />
            <SortTh label="Type" active={sortKey === "type"} dir={sortDir} onClick={() => onSort("type")} />
            <SortTh label="Total" active={sortKey === "total"} dir={sortDir} onClick={() => onSort("total")} className="text-right" />
            <SortTh label="HP" active={sortKey === "hp"} dir={sortDir} onClick={() => onSort("hp")} className="text-right" />
            <SortTh label="Atk" active={sortKey === "atk"} dir={sortDir} onClick={() => onSort("atk")} className="text-right" />
            <SortTh label="Def" active={sortKey === "def"} dir={sortDir} onClick={() => onSort("def")} className="text-right" />
            <SortTh label="SpA" active={sortKey === "spa"} dir={sortDir} onClick={() => onSort("spa")} className="text-right" />
            <SortTh label="SpD" active={sortKey === "spd"} dir={sortDir} onClick={() => onSort("spd")} className="text-right" />
            <SortTh label="Spe" active={sortKey === "spe"} dir={sortDir} onClick={() => onSort("spe")} className="text-right" />
            <TableHead className="w-[56px]"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((p) => {
            const selected = team.includes(p.name);
            return (
              <TableRow key={p.name} className="hover:bg-muted/50">
                <TableCell className="font-mono text-muted-foreground whitespace-nowrap">
                  {String(p.id).padStart(4, "0")}
                </TableCell>

                <TableCell>
                  {p.sprite ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.sprite} alt={p.name} width={48} height={48} className="shrink-0" />
                  ) : null}
                </TableCell>

                <TableCell className="min-w-[160px]">
                  <Link href={`/pokemon/${p.name}`} className="font-medium capitalize hover:underline inline-block">
                    {p.name}
                  </Link>
                </TableCell>

                <TableCell className="min-w-[160px]">
                  <div className="flex gap-2 flex-wrap">
                    {p.types.map((t) => (
                      <TypeBadge key={t} type={t} />
                    ))}
                  </div>
                </TableCell>

                <TableCell className="text-right font-mono">{p.stats.total}</TableCell>
                <TableCell className="text-right font-mono">{p.stats.hp}</TableCell>
                <TableCell className="text-right font-mono">{p.stats.atk}</TableCell>
                <TableCell className="text-right font-mono">{p.stats.def}</TableCell>
                <TableCell className="text-right font-mono">{p.stats.spa}</TableCell>
                <TableCell className="text-right font-mono">{p.stats.spd}</TableCell>
                <TableCell className="text-right font-mono">{p.stats.spe}</TableCell>

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
