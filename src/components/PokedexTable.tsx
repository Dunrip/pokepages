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

export function PokedexTable({
  rows,
  team,
  onToggleTeam,
}: {
  rows: PokemonRow[];
  team: string[];
  onToggleTeam: (name: string) => void;
}) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <Table>
        <TableHeader className="sticky top-0 bg-card z-10">
          <TableRow>
            <TableHead className="w-[72px]">#</TableHead>
            <TableHead className="w-[64px]"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="w-[56px]"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((p) => {
            const selected = team.includes(p.name);
            return (
              <TableRow key={p.name} className="hover:bg-muted/50">
                <TableCell className="font-mono text-muted-foreground">
                  {String(p.id).padStart(4, "0")}
                </TableCell>

                <TableCell>
                  {p.sprite ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.sprite} alt={p.name} width={40} height={40} className="shrink-0" />
                  ) : null}
                </TableCell>

                <TableCell>
                  <Link href={`/pokemon/${p.name}`} className="font-medium capitalize hover:underline inline-block">
                    {p.name}
                  </Link>
                </TableCell>

                <TableCell>
                  <div className="flex gap-2 flex-wrap">
                    {p.types.map((t) => (
                      <TypeBadge key={t} type={t} />
                    ))}
                  </div>
                </TableCell>

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
