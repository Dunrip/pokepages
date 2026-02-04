import Link from "next/link";
import { decodeTeam } from "@/lib/team-codec";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function TeamPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const team = decodeTeam(code);

  return (
    <main className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between">
        <Link href={`/?team=${encodeURIComponent(code)}`} className="text-sm underline">
          ← Open in Team Builder
        </Link>
        <Link href="/" className="text-sm underline">
          Home
        </Link>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Shared Team</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="p-4">
          {team.length ? (
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {team.map((n) => (
                <li key={n} className="border rounded-md px-3 py-2 capitalize">
                  {n}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Invalid or empty team code.</p>
          )}

          <p className="text-xs text-muted-foreground mt-4">Code: {code}</p>
        </CardContent>
      </Card>
    </main>
  );
}
