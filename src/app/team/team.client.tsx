"use client";

import { TeamBuilder, useTeam } from "@/components/TeamBuilder";
import { TeamShare } from "@/components/TeamShare";

export default function TeamBuilderPageClient() {
  const { team, removeMember, clear } = useTeam();

  return (
    <div className="space-y-4">
      <TeamBuilder team={team} removeMember={removeMember} clear={clear} />
      <TeamShare team={team} />
    </div>
  );
}
