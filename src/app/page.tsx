import Link from "next/link";
import { 
  Sparkles, 
  PenTool, 
  Image as ImageIcon, 
  FileText, 
  Share2, 
  Zap, 
  Layers, 
  ShieldCheck, 
  ArrowRight,
  CheckCircle2,
  Terminal,
  Cpu
} from "lucide-react";

/**
 * QuickAI Hero Landing Page (Server Component)
 * 
 * Features:
 * 1. High-impact dark mode hero with glowing gradient effects
 * 2. 6-Feature Studio Showcase cards
 * 3. Live Tech Stack & Architecture proof points (Next.js 15, Drizzle ORM, pgvector)
 * 4. Clear Call-to-Actions (CTAs) for users & interviewers
 */
export default function HomePage() {
  const studios = [
    {
      title: "Split-Pane Article Studio",
      description: "Real-time token streaming on the left paired with an interactive Rich Text WYSIWYG editor on the right for 1-click AI refactoring.",
      icon: PenTool,
      tag: "Phase 2",
      badgeColor: "from-blue-500/20 to-indigo-500/20 text-indigo-300 border-indigo-500/30",
      href: "/studio/article",
    },
    {
      title: "Canvas Inpainting Studio",
      description: "Interactive HTML5/Fabric.js brush canvas. Paint over objects to seamlessly remove them or type generative prompts to replace them.",
      icon: ImageIcon,
      tag: "Phase 3",
      badgeColor: "from-purple-500/20 to-pink-500/20 text-pink-300 border-pink-500/30",
      href: "/studio/image",
    },
    {
      title: "Community Hub & Prompt Remix",
      description: "Public creation showcase. Explore top community articles and art, with a 1-click 'Remix' button to fork prompts directly into your studio.",
      icon: Share2,
      tag: "Phase 4",
      badgeColor: "from-emerald-500/20 to-teal-500/20 text-teal-300 border-teal-500/30",
      href: "/community",
    },
    {
      title: "Multi-Tenant Credit Quotas",
      description: "Atomic PostgreSQL transaction deductions to prevent race conditions, tier gating (Free vs Pro), and creation history tracking.",
      icon: Zap,
      tag: "Phase 5",
      badgeColor: "from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30",
      href: "/dashboard",
    },
    {
      title: "Flagship Document Hybrid RAG",
      description: "Ingest PDFs with layout semantic chunking. Combines dense vector embeddings with BM25 sparse search and interactive yellow coordinate highlights.",
      icon: FileText,
      tag: "Phase 6 Flagship",
      badgeColor: "from-rose-500/20 to-red-500/20 text-rose-300 border-rose-500/30",
      href: "/studio/rag",
    },
    {
      title: "Full-Stack Next.js 15 & Drizzle",
      description: "Modern Server Actions, React Server Components, Drizzle ORM on Neon Postgres, strict TypeScript, and sub-50ms streaming latency.",
      icon: Layers,
      tag: "Phase 1 Foundation",
      badgeColor: "from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30",
      href: "/dashboard",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-grid-pattern">
      {/* Ambient Lighting Orbs */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-600/25 via-purple-600/20 to-pink-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-96 right-10 w-[450px] h-[450px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Release Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-indigo-500/30 mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span className="text-xs font-semibold tracking-wide text-indigo-200">
            Sutra AI • Multimodal SaaS & Document Intelligence Platform
          </span>
          <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-400" />
        </div>

        {/* Main Hero Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl leading-[1.15]">
          Supercharge Content & Multimodal Creation with{" "}
          <span className="gradient-text">Intelligent AI Studios</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-3xl font-normal leading-relaxed">
          From Claude Artifacts-style split-pane article writing and brush canvas image inpainting to hybrid PDF RAG intelligence with exact citation coordinate highlights.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 text-white font-semibold text-base shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2.5 group transition-all"
          >
            Launch Studio
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/community"
            className="w-full sm:w-auto px-8 py-4 rounded-xl glass-panel hover:bg-secondary/70 text-white font-medium text-base border border-border/80 flex items-center justify-center gap-2 transition-colors"
          >
            Explore Community Prompts
          </Link>
        </div>

        {/* Trust & Architecture Metrics */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 w-full max-w-4xl pt-8 border-t border-border/40">
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-bold gradient-text">Next.js 15</span>
            <span className="text-xs text-muted-foreground mt-1">App Router & RSC</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-bold gradient-text">Drizzle ORM</span>
            <span className="text-xs text-muted-foreground mt-1">Neon Postgres + pgvector</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-bold gradient-text">&lt; 50ms</span>
            <span className="text-xs text-muted-foreground mt-1">Token Streaming TTFT</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-bold gradient-text">100% Typed</span>
            <span className="text-xs text-muted-foreground mt-1">Strict TypeScript</span>
          </div>
        </div>
      </section>

      {/* 6 AI Studios Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
            Built with 6 Commercial AI Engineering Suites
          </h2>
          <p className="text-muted-foreground mt-3 text-sm sm:text-base max-w-2xl mx-auto">
            Everything you need to write articles, inpaint images, parse resumes, and search PDFs with ground-truth citations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studios.map((studio) => {
            const Icon = studio.icon;
            return (
              <div
                key={studio.title}
                className="glass-card rounded-2xl p-6 flex flex-col justify-between group hover:border-indigo-500/40 relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary/80 border border-border/80 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:text-white group-hover:bg-indigo-600 transition-all duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border bg-gradient-to-r ${studio.badgeColor}`}>
                      {studio.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {studio.title}
                  </h3>

                  <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">
                    {studio.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between">
                  <Link
                    href={studio.href}
                    className="text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1.5"
                  >
                    Open Studio
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400/80" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Architectural Value Proposition for Interviews */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-indigo-500/20 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs font-semibold mb-4">
                <Terminal className="w-3.5 h-3.5" />
                System Design & Engineering Defense
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white">
                Why Next.js 15 App Router + Drizzle ORM?
              </h3>
              <p className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed">
                By unifying frontend React Server Components with serverless Drizzle ORM queries and Clerk Auth middleware, Sutra eliminates CORS hops, achieves zero-overhead database queries, and streams AI tokens directly into the browser.
              </p>
              <div className="mt-6 flex flex-wrap gap-4 text-xs font-medium text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  Zero Connection Pool Exhaustion (Neon HTTP)
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Atomic Credit Deductions
                </span>
              </div>
            </div>

            <Link
              href="/dashboard"
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm shadow-xl flex items-center gap-2 whitespace-nowrap transition-all"
            >
              Get Started Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
