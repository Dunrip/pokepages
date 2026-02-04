"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { encodeTeam } from "@/lib/team-codec";
import { toast } from "sonner";

export function TeamShare({ team }: { team: string[] }) {
  const code = useMemo(() => encodeTeam(team), [team]);

  const links = useMemo(() => {
    if (typeof window === "undefined") return { query: "", pretty: "" };
    const base = window.location.origin;
    const query = code ? `${base}/?team=${encodeURIComponent(code)}` : "";
    const pretty = code ? `${base}/team/${encodeURIComponent(code)}` : "";
    return { query, pretty };
  }, [code]);

  async function copy(text: string, label: string) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast(`Copied ${label}`);
    } catch {
      toast("Copy failed — you can manually select and copy");
    }
  }

  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle className="text-base">Share team</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="p-3 space-y-3">
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Pretty link</div>
          <Input readOnly value={links.pretty} />
          <Button className="w-full" onClick={() => copy(links.pretty, "pretty link")} disabled={!links.pretty}>
            Copy pretty link
          </Button>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Query link</div>
          <Input readOnly value={links.query} />
          <Button className="w-full" variant="secondary" onClick={() => copy(links.query, "query link")} disabled={!links.query}>
            Copy query link
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">Opening either link will load your team.</p>
      </CardContent>
    </Card>
  );
}
