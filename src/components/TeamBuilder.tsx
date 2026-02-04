"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const LS_KEY = "pokepages.team.v1";

export function useTeam() {
  const [team, setTeam] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(team));
    } catch {}
  }, [team]);

  const setMember = (name: string) => {
    setTeam((prev) => {
      if (prev.includes(name)) return prev;
      if (prev.length >= 6) return prev;
      return [...prev, name];
    });
  };

  const removeMember = (name: string) => setTeam((prev) => prev.filter((n) => n !== name));
  const clear = () => setTeam([]);

  return { team, setMember, removeMember, clear };
}

export function TeamBuilder({ team, removeMember, clear }: {
  team: string[];
  removeMember: (name: string) => void;
  clear: () => void;
}) {
  const filled = useMemo(() => {
    const slots = [...team];
    while (slots.length < 6) slots.push("");
    return slots;
  }, [team]);

  return (
    <Card>
      <CardHeader className="py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Team Builder</CardTitle>
          <Button size="sm" variant="secondary" onClick={clear} disabled={team.length === 0}>
            Clear
          </Button>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-0">
        <ScrollArea className="h-[220px]">
          <div className="p-3 grid grid-cols-1 gap-2">
            {filled.map((name, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-md border px-3 py-2">
                <div className="text-sm">
                  <span className="text-muted-foreground mr-2">#{idx + 1}</span>
                  <span className={name ? "capitalize" : "text-muted-foreground"}>
                    {name || "Empty"}
                  </span>
                </div>
                {name ? (
                  <Button size="sm" variant="ghost" onClick={() => removeMember(name)}>
                    Remove
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
