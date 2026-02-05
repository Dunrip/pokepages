import Link from "next/link";
import { Button } from "@/components/ui/button";
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
      <CardContent className="p-3 pt-10 relative">
        {typeof selected === "boolean" ? (
          <Button
            type="button"
            size="icon"
            variant={selected ? "default" : "secondary"}
            className="absolute right-2 top-2 h-7 w-7 rounded-full z-10"
            title={selected ? "Remove from team" : "Add to team"}
            onClick={(e) => {
              e.preventDefault();
              onToggleSelect?.();
            }}
          >
            {selected ? "−" : "+"}
          </Button>
        ) : null}

        <div className="flex items-center gap-3">
          {id ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={spriteUrl(id)} alt={name} width={56} height={56} />
          ) : null}

          <div className="min-w-0 flex-1">
            <Link
              href={`/pokemon/${name}`}
              className="font-semibold capitalize hover:underline block"
              title={name}
            >
              {/* Avoid truncate: showing only first letter on some layouts */}
              <span className="truncate">{name}</span>
            </Link>

            {id ? (
              <div className="text-xs text-muted-foreground">#{String(id).padStart(4, "0")}</div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
