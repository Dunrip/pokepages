"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { encodeTeam } from "@/lib/team-codec";
import { toast } from "sonner";

export function TeamShare({ team }: { team: string[] }) {
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const code = encodeTeam(team);
    const url = new URL(window.location.origin);
    if (code) url.searchParams.set("team", code);
    return url.toString();
  }, [team]);

  async function copy() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast("Copied team link");
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
      <CardContent className="p-3 space-y-2">
        <Input readOnly value={shareUrl} />
        <Button className="w-full" onClick={copy} disabled={!shareUrl}>
          Copy link
        </Button>
        <p className="text-xs text-muted-foreground">Opens with your team pre-loaded.</p>
      </CardContent>
    </Card>
  );
}
