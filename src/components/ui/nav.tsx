"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function FloatingNav() {
  const { theme, setTheme } = useTheme();

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 backdrop-blur-sm bg-white/30 dark:bg-black/30 rounded-full px-4 py-2 shadow-lg">
      <div className="flex gap-2 items-center">
        <NavLink href="/">Home</NavLink>
        <NavLink href="/journal">Journal</NavLink>
        <NavLink href="/stats">Statistics</NavLink>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Moon size={20} /> : <Sun size={20} />}
        </Button>
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href}>
      <Button variant="ghost" className="rounded-full">
        {children}
      </Button>
    </Link>
  );
}