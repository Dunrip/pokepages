"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import { TeamBuilder, useTeam } from "@/components/TeamBuilder";
import { TeamShare } from "@/components/TeamShare";
import { decodeTeam, encodeTeam } from "@/lib/team-codec";

export default function TeamPage() {
  const { team, removeMember, clear, replaceTeam } = useTeam();
  const [importText, setImportText] = useState("");

  const code = useMemo(() => encodeTeam(team), [team]);

  function exportNames() {
    return team.join("\n");
  }

  function doCopy(text: string, label: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => toast(`Copied ${label}`))
      .catch(() => toast("Copy failed"));
  }

  function onImport() {
    const raw = importText.trim();
    if (!raw) {
      toast("Paste a team first");
      return;
    }

    const byCode = decodeTeam(raw);
    if (byCode.length) {
      replaceTeam(byCode);
      toast("Imported team from code");
      return;
    }

    const names = raw
      .split(/\r?\n|,/g)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    if (!names.length) {
      toast("No names found");
      return;
    }

    replaceTeam(names);
    toast("Imported team");
  }

  return (
    <main className="min-h-[calc(100vh-3.5rem)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Team</h1>
            <p className="text-sm text-muted-foreground">Import, export, and share a 6-Pokémon team.</p>
          </div>

          {code ? (
            <Button asChild variant="secondary">
              <Link href={`/team/${code}`}>Pretty link</Link>
            </Button>
          ) : null}
        </header>

        <Separator className="my-6" />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <section className="space-y-4">
            <Card>
              <CardHeader className="py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Import / Export</CardTitle>
                  <Button variant="secondary" size="sm" onClick={clear} disabled={!team.length}>
                    Clear
                  </Button>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="p-4 space-y-3">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Import</label>
                  <Textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="Paste a share code, or names (one per line / comma-separated)"
                    className="min-h-[120px]"
                  />
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={onImport} className="sm:w-auto">
                      Import
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setImportText(exportNames());
                        toast("Filled with current team");
                      }}
                    >
                      Fill with current
                    </Button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Export</label>
                  <Input readOnly value={code} placeholder="(team code will appear here)" />
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="secondary" onClick={() => doCopy(code, "code")} disabled={!code}>
                      Copy code
                    </Button>
                    <Button variant="secondary" onClick={() => doCopy(exportNames(), "names")} disabled={!team.length}>
                      Copy names
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tip: you can also open <span className="font-mono">/team/[code]</span> directly.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          <aside className="lg:sticky lg:top-20 h-fit space-y-4">
            <TeamBuilder team={team} removeMember={removeMember} clear={clear} />
            <TeamShare team={team} />
          </aside>
        </div>
      </div>
    </main>
  );
}
