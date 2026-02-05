import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import TeamBuilderPageClient from "./team.client";

export default function TeamPage() {
  return (
    <main className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Team Builder</h1>
            <p className="text-sm text-muted-foreground">Build a 6-slot team and share it with a link.</p>
          </div>
          <Link href="/" className="text-sm underline">
            ← Back to Pokédex
          </Link>
        </header>

        <Separator className="my-6" />

        <TeamBuilderPageClient />
      </div>
    </main>
  );
}
