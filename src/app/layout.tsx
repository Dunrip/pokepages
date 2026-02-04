import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "PokePages",
  description: "A paginated Pokédex with global type filtering and team builder.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <Navbar />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
