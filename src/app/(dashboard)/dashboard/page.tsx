import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { creations, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { 
  PenTool, 
  Image as ImageIcon, 
  FileText, 
  Zap, 
  Sparkles, 
  Clock, 
  Plus, 
  ArrowUpRight, 
  Flame, 
  FileCheck2,
  FolderOpen
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * QuickAI Dashboard Page (React Server Component)
 * 
 * Direct Server-Side Data Fetching:
 * Drizzle ORM queries direct server par run hoti hain, bina kisi extra Axios HTTP request ke!
 * Is se loading time 0ms hota hai aur sensitive queries client browser ko expose nahi hoti.
 */
export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  // 1. Fetch user profile & credits
  const user = await getOrCreateCurrentUser();
  const credits = user?.credits ?? 20;
  const userPlan = user?.plan ?? "free";

  // 2. Fetch user's creations history directly from Drizzle
  const userCreations = await db.query.creations.findMany({
    where: eq(creations.userId, userId),
    orderBy: [desc(creations.createdAt)],
    limit: 10,
  });

  const creationCards = [
    {
      title: "Write Article",
      description: "Generate structured articles with split-pane live token streaming and TipTap editor.",
      icon: PenTool,
      href: "/studio/article",
      color: "from-blue-600 to-indigo-600",
    },
    {
      title: "Image & Inpainting",
      description: "Generate photorealistic art or paint over objects with generative brush canvas.",
      icon: ImageIcon,
      href: "/studio/image",
      color: "from-purple-600 to-pink-600",
    },
    {
      title: "Document RAG",
      description: "Chat with PDFs using hybrid dense vector + BM25 search and clickable citations.",
      icon: FileText,
      href: "/studio/rag",
      color: "from-rose-600 to-orange-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome Area */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-indigo-500/20 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Active Plan: <span className="capitalize font-bold text-white">{userPlan}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Welcome back, <span className="gradient-text">{user?.name || "Creator"}</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your AI studios, explore past creations, or start a new generation.
          </p>
        </div>

        {/* Credit Quota Widget */}
        <div className="glass-card rounded-2xl p-4 border border-indigo-500/30 flex items-center gap-4 relative z-10 w-full md:w-auto">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Zap className="w-6 h-6 text-white fill-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
              Available Credits
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white">{credits}</span>
              <span className="text-xs text-muted-foreground">/ 20 Daily</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Launch Studios Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-indigo-400" />
            Quick AI Studios
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {creationCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.href}
                className="glass-card rounded-2xl p-5 group flex flex-col justify-between hover:border-indigo-500/40"
              >
                <div>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${card.color} flex items-center justify-center text-white mb-3 shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white group-hover:text-indigo-300 transition-colors flex items-center justify-between">
                    {card.title}
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-indigo-400" />
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/40 text-[11px] font-semibold text-indigo-400 flex items-center gap-1">
                  Launch Studio &rarr;
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Creations History */}
      <div className="glass-panel rounded-2xl p-6 border border-border/60">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Your Creation History</h2>
          </div>
          <span className="text-xs text-muted-foreground">
            {userCreations.length} items saved in Neon DB
          </span>
        </div>

        {userCreations.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-secondary/80 flex items-center justify-center text-muted-foreground mb-3">
              <FolderOpen className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-semibold text-white">No creations yet</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Launch one of the AI studios above to generate your first article, image, or resume review!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {userCreations.map((item) => (
              <div
                key={item.id}
                className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-secondary/30 px-3 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white line-clamp-1">{item.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1">{item.prompt}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className="text-[11px] capitalize px-2 py-0.5 rounded bg-secondary text-slate-300 border border-border">
                    {item.type}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
