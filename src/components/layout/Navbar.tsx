"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import {
  Scissors,
  LayoutDashboard,
  SquarePen,
  Hash,
  Image as ImageIcon,
  Users,
  Zap,
  Plus,
  FileSearch,
  Activity,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PricingModal } from "./PricingModal";

export function Navbar({ credits: initialCredits = 20 }: { credits?: number }) {
  const pathname = usePathname();
  const [credits, setCredits] = useState<number>(initialCredits);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const navLinks = [
    { name: "Hybrid RAG", href: "/studio/rag", icon: FileSearch, color: "text-rose-500" },
    { name: "Articles", href: "/studio/article", icon: SquarePen, color: "text-indigo-500" },
    { name: "AI Images", href: "/studio/image", icon: ImageIcon, color: "text-emerald-500" },
    { name: "Inpaint", href: "/studio/remove-object", icon: Scissors, color: "text-purple-500" },
    { name: "Community", href: "/community", icon: Users, color: "text-blue-500" },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, color: "text-amber-500" },
    { name: "Observability", href: "/observability", icon: Activity, color: "text-teal-500" },
  ];

  return (
    <>
      <header className="sticky top-3 z-50 w-full px-3 sm:px-6 max-w-7xl mx-auto pointer-events-auto">
        <div className="rounded-full bg-white/95 backdrop-blur-lg border border-emerald-100 shadow-xl shadow-emerald-500/5 px-4 sm:px-6 h-16 flex items-center justify-between transition-all duration-300 hover:shadow-emerald-500/10">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 rounded-full overflow-hidden shadow-xs ring-2 ring-emerald-100 group-hover:scale-105 transition-transform duration-200">
              <Image
                src="/logo.png"
                alt="Sutra AI Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight bg-gradient-to-r from-emerald-700 via-teal-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-1">
                Sutra<span className="font-extrabold text-emerald-600">AI</span>
              </span>
            </div>
          </Link>

          {/* Navigation Links for Desktop */}
          <nav className="hidden lg:flex items-center gap-1 bg-emerald-50/50 p-1 rounded-full border border-emerald-100/60 shadow-inner">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200",
                    isActive
                      ? "bg-white text-emerald-800 shadow-sm border border-emerald-200 font-bold scale-[1.02]"
                      : "text-slate-600 hover:text-emerald-700 hover:bg-white/60"
                  )}
                >
                  <Icon className={cn("w-3.5 h-3.5", isActive ? "text-emerald-600" : link.color)} />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Auth & Credit Action Area */}
          <div className="flex items-center gap-2">
            <SignedIn>
              {/* Clickable Live Credit Indicator Badge */}
              <button
                onClick={() => setIsPricingModalOpen(true)}
                className="group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-linear-to-r from-amber-50 to-emerald-50 hover:from-amber-100 hover:to-emerald-100 border border-amber-200/80 text-amber-900 text-xs font-bold shadow-xs transition-all hover:scale-105 cursor-pointer"
                title="Click to upgrade or add credits"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 group-hover:scale-110 transition-transform" />
                <span>{credits} Credits</span>
                <span className="w-4 h-4 rounded-full bg-amber-200/80 text-amber-900 flex items-center justify-center text-[10px] ml-0.5">
                  <Plus className="w-3 h-3" />
                </span>
              </button>

              {/* Clerk User Avatar Menu */}
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 rounded-full border-2 border-emerald-200 hover:scale-105 transition-transform",
                  },
                }}
              />
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-3.5 py-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:bg-emerald-50 rounded-full transition-colors cursor-pointer">
                  Sign In
                </button>
              </SignInButton>

              <SignInButton mode="modal">
                <button className="px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all cursor-pointer">
                  Get Started
                </button>
              </SignInButton>
            </SignedOut>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 bg-white/95 backdrop-blur-lg border border-emerald-100 rounded-3xl p-3 shadow-xl space-y-1 animate-in slide-in-from-top-2 duration-200">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-4 py-2.5 rounded-full text-xs font-semibold transition-all",
                    isActive
                      ? "bg-emerald-500 text-white font-bold shadow-sm"
                      : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={cn("w-4 h-4", isActive ? "text-white" : link.color)} />
                    <span>{link.name}</span>
                  </div>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Pricing Upgrade Modal */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        currentCredits={credits}
        onCreditsUpdated={(newCredits) => setCredits(newCredits)}
      />
    </>
  );
}

