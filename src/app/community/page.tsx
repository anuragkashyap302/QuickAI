import { db } from "@/db";
import { creations } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { Users, Sparkles } from "lucide-react";
import Link from "next/link";
import { CommunityFeed } from "@/components/community/CommunityFeed";

export const dynamic = "force-dynamic";

/**
 * Community Creations Hub (Server Component)
 * 
 * Public Feed with 1-Click Prompt Remixing Engine, category filters, and optimistic likes.
 */
export default async function CommunityPage() {
  const { userId } = await auth();

  // Fetch all published creations
  const publicCreations = await db.query.creations.findMany({
    where: eq(creations.publish, true),
    orderBy: [desc(creations.createdAt)],
    limit: 30,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Community Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-border/40">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-semibold mb-2">
            <Users className="w-3.5 h-3.5" />
            Phase 4 • Community Creations Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Community Creations Feed</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Explore trending AI creations and remix any prompt directly into your active studio in 1 click.
          </p>
        </div>

        <Link
          href="/studio/article"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/20 transition-all"
        >
          Create & Share
        </Link>
      </div>

      {/* Interactive Community Feed */}
      <CommunityFeed initialCreations={publicCreations} currentUserId={userId} />
    </div>
  );
}
