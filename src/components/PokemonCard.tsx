import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getIdFromPokemonUrl, spriteUrl } from "@/lib/pokeapi";

export function PokemonCard({
  name,
  url,
  selected,
  onToggleSelect,
}: {
  name: string;
  url: string;
  selected?: boolean;
  onToggleSelect?: () => void;
}) {
  const id = getIdFromPokemonUrl(url);
  return (
    <Card className={selected ? "ring-2 ring-primary" : ""}>
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          {id ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={spriteUrl(id)} alt={name} width={56} height={56} />
          ) : null}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <Link href={`/pokemon/${name}`} className="font-semibold capitalize truncate hover:underline">
                {name}
              </Link>
              {typeof selected === "boolean" ? (
                <Badge
                  variant={selected ? "default" : "secondary"}
                  className="cursor-pointer select-none"
                  onClick={(e) => {
                    e.preventDefault();
                    onToggleSelect?.();
                  }}
                >
                  {selected ? "In Team" : "+ Team"}
                </Badge>
              ) : null}
            </div>
            {id ? <div className="text-xs text-muted-foreground">#{String(id).padStart(4, "0")}</div> : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
