import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function PokemonPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const r = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`,
    { next: { revalidate: 3600 } }
  );

  if (!r.ok) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <Link href="/" className="text-sm underline">← Back</Link>
        <p className="mt-4">Not found.</p>
      </main>
    );
  }

  const p = (await r.json()) as import("@/lib/pokemon-types").PokemonDetail;

  return (
    <main className="max-w-3xl mx-auto p-6">
      <Link href="/" className="text-sm underline">← Back</Link>

      <div className="flex items-center justify-between mt-3">
        <h1 className="text-3xl font-bold capitalize">{p.name}</h1>
        <div className="text-sm text-muted-foreground font-mono">#{String(p.id).padStart(4, "0")}</div>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.sprites.front_default ?? undefined} alt={p.name} width={96} height={96} />
            <div>
              <div className="text-sm text-muted-foreground">Types</div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {p.types.map((t: { type: { name: string } }) => (
                  <Badge key={t.type.name} variant="secondary" className="capitalize">
                    {t.type.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <Separator className="my-5" />

          <div>
            <div className="text-sm text-muted-foreground">Abilities</div>
            <div className="flex gap-2 mt-2 flex-wrap">
              {p.abilities.map((a: { ability: { name: string } }) => (
                <Badge key={a.ability.name} className="capitalize">
                  {a.ability.name}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Base stats</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {p.stats.map((s: { stat: { name: string }; base_stat: number }) => (
              <li key={s.stat.name} className="flex items-center justify-between border-b py-2">
                <span className="capitalize">{s.stat.name}</span>
                <span className="font-mono">{s.base_stat}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}
