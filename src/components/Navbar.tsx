"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    cn(
      "text-sm font-medium transition-colors hover:text-foreground",
      pathname === href ? "text-foreground" : "text-muted-foreground"
    );

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-semibold tracking-tight">PokePages</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">Pokédex + Team Builder</span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link className={linkClass("/")} href="/">
            Pokédex
          </Link>
          <Link className={linkClass("/team")} href="/team">
            Team
          </Link>
        </nav>
      </div>
    </header>
  );
}
