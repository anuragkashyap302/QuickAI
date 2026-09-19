"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Sparkles, LayoutDashboard, SquarePen, Hash, Image as ImageIcon, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar({ credits = 20 }: { credits?: number }) {
  const pathname = usePathname();

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Articles", href: "/studio/article", icon: SquarePen },
    { name: "Blog Titles", href: "/studio/blog-titles", icon: Hash },
    { name: "AI Images", href: "/studio/image", icon: ImageIcon },
    { name: "Community", href: "/community", icon: Users },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 glass-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              Sutra<span className="gradient-text">AI</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                v2.0
              </span>
            </span>
          </div>
        </Link>

        {/* Navigation Links for Desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm"
                    : "text-muted-foreground hover:text-white hover:bg-secondary/60"
                )}
              >
                <Icon className="w-4 h-4" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Auth & Credit Action Area */}
        <div className="flex items-center gap-3">
          <SignedIn>
            {/* Live Credit Indicator Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow-inner">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{credits} Credits</span>
            </div>

            {/* Clerk User Avatar Menu */}
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9 border border-indigo-500/30 hover:scale-105 transition-transform",
                },
              }}
            />
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-5 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer">
                Get Started Free
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
