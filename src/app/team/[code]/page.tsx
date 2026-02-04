"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { TeamBuilder, useTeam } from "@/components/TeamBuilder";
import { decodeTeam, encodeTeam } from "@/lib/team-codec";

export default function TeamCodePage() {
  const params = useParams<{ code: string }>();
  const codeParam = typeof params?.code === "string" ? params.code : "";

  const decoded = useMemo(() => decodeTeam(codeParam), [codeParam]);
  const { team, removeMember, clear, replaceTeam } = useTeam();

  useEffect(() => {
    if (!decoded.length) return;
    replaceTeam(decoded);
  }, [decoded, replaceTeam]);

  const code = useMemo(() => encodeTeam(team), [team]);

  function copyPrettyLink() {
    const url = new URL(window.location.origin);
    url.pathname = `/team/${code}`;
    navigator.clipboard
      .writeText(url.toString())
      .then(() => toast("Copied link"))
      .catch(() => toast("Copy failed"));
  }

  return (
    <main className="min-h-[calc(100vh-3.5rem)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Team</h1>
            <p className="text-sm text-muted-foreground">
              Loaded from <span className="font-mono">/team/{codeParam}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="secondary">
              <Link href="/">Back</Link>
            </Button>
            <Button onClick={copyPrettyLink} disabled={!code}>
              Copy link
            </Button>
          </div>
        </header>

        <Separator className="my-6" />

        {!decoded.length ? (
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-base">Invalid team code</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                This link doesn’t look like a valid team code. You can still build a team manually.
              </p>
              <Button asChild variant="secondary" className="mt-3">
                <Link href="/team">Go to Team page</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <div className="mt-6">
          <TeamBuilder team={team} removeMember={removeMember} clear={clear} />
        </div>
      </div>
    </main>
  );
}
