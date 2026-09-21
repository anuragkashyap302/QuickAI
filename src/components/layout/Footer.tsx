import Link from "next/link";
import Image from "next/image";
import { Sparkles, Github, Twitter, Heart, ShieldCheck, Zap } from "lucide-react";

/**
 * Sutra AI Global Footer (Light Mode, inspired by footerStyles)
 */
export function Footer() {
  return (
    <footer className="w-full border-t border-emerald-100 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/60 mt-auto relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3.5">
          <div className="relative w-9 h-9 rounded-full overflow-hidden shadow-xs ring-2 ring-emerald-100">
            <Image src="/logo.png" alt="Sutra AI" fill className="object-cover" />
          </div>
          <div>
            <span className="text-sm font-black bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
              Sutra AI
            </span>
            <p className="text-[11px] text-slate-500 font-medium">
              Enterprise Multimodal AI SaaS & Document Intelligence Platform.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-slate-700">
          <Link
            href="/studio/rag"
            className="px-3.5 py-1.5 rounded-full bg-white/80 border border-emerald-100 hover:bg-emerald-50 hover:text-emerald-800 transition-all shadow-2xs"
          >
            Hybrid RAG
          </Link>
          <Link
            href="/studio/article"
            className="px-3.5 py-1.5 rounded-full bg-white/80 border border-emerald-100 hover:bg-emerald-50 hover:text-emerald-800 transition-all shadow-2xs"
          >
            Articles
          </Link>
          <Link
            href="/community"
            className="px-3.5 py-1.5 rounded-full bg-white/80 border border-emerald-100 hover:bg-emerald-50 hover:text-emerald-800 transition-all shadow-2xs"
          >
            Community
          </Link>
          <Link
            href="/observability"
            className="px-3.5 py-1.5 rounded-full bg-white/80 border border-emerald-100 hover:bg-emerald-50 hover:text-emerald-800 transition-all shadow-2xs"
          >
            Observability
          </Link>
          <a
            href="https://github.com/anuragkashyap302/QuickAI"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-1.5 rounded-full bg-white/80 border border-emerald-100 hover:bg-slate-900 hover:text-white transition-all shadow-2xs flex items-center gap-1.5"
          >
            <Github className="w-3.5 h-3.5" />
            GitHub
          </a>
        </div>
      </div>
      <div className="border-t border-emerald-100/60 py-3 text-center text-[11px] text-slate-400 font-medium">
        © {new Date().getFullYear()} Sutra AI. Crafted for next-generation creators and researchers.
      </div>
    </footer>
  );
}

