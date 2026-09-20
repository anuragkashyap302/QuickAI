"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Heart,
  Share2,
  Search,
  Sparkles,
  SquarePen,
  Hash,
  Image as ImageIcon,
  Scissors,
  FileText,
  Cpu,
  ArrowUpRight,
  Zap,
  Check,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

export interface PublicCreation {
  id: number;
  type: string;
  title: string | null;
  prompt: string;
  content: string;
  imageUrl?: string | null;
  likes?: string[] | null;
  likesCount?: number | null;
  createdAt: Date | string;
}

const TYPE_CONFIG: { [key: string]: { label: string; icon: typeof FileText; color: string; studioHref: string } } = {
  article: { label: "Article", icon: SquarePen, color: "text-blue-400 bg-blue-500/10 border-blue-500/30", studioHref: "/studio/article" },
  "blog-title": { label: "Blog Titles", icon: Hash, color: "text-purple-400 bg-purple-500/10 border-purple-500/30", studioHref: "/studio/blog-titles" },
  image: { label: "AI Image", icon: ImageIcon, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", studioHref: "/studio/image" },
  "object-removal": { label: "Inpainting", icon: Scissors, color: "text-rose-400 bg-rose-500/10 border-rose-500/30", studioHref: "/studio/remove-object" },
  "document-rag": { label: "Hybrid RAG", icon: Cpu, color: "text-pink-400 bg-pink-500/10 border-pink-500/30", studioHref: "/studio/rag" },
  "resume-review": { label: "Resume ATS", icon: FileText, color: "text-teal-400 bg-teal-500/10 border-teal-500/30", studioHref: "/studio/review-resume" },
};

export function CommunityFeed({
  initialCreations = [],
  currentUserId,
}: {
  initialCreations: PublicCreation[];
  currentUserId?: string | null;
}) {
  const router = useRouter();
  const [creations, setCreations] = useState<PublicCreation[]>(initialCreations);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [likedPosts, setLikedPosts] = useState<{ [key: number]: boolean }>(() => {
    const initialLiked: { [key: number]: boolean } = {};
    if (currentUserId) {
      initialCreations.forEach((item) => {
        if (item.likes && item.likes.includes(currentUserId)) {
          initialLiked[item.id] = true;
        }
      });
    }
    return initialLiked;
  });
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Filtered public feed
  const filteredFeed = creations.filter((item) => {
    const matchesCategory =
      activeCategory === "all" ||
      item.type.toLowerCase().includes(activeCategory.toLowerCase());

    const matchesSearch =
      (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.prompt && item.prompt.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  // 1-Click Prompt Remixing Engine
  const handleRemix = (item: PublicCreation) => {
    const config = TYPE_CONFIG[item.type] || { studioHref: "/studio/article" };
    const queryParams = new URLSearchParams({
      remixPrompt: item.prompt,
      title: item.title || "",
      type: item.type,
    });

    toast.success(`✨ Remixing prompt into ${config.label || "Studio"}!`);
    router.push(`${config.studioHref}?${queryParams.toString()}`);
  };

  // Optimistic Like Handler
  const handleToggleLike = async (item: PublicCreation) => {
    if (!currentUserId) {
      toast.error("Please sign in to like community creations");
      return;
    }

    const isCurrentlyLiked = likedPosts[item.id] || false;
    const previousLikesCount = item.likesCount || 0;

    // 1. Optimistic UI update
    setLikedPosts((prev) => ({ ...prev, [item.id]: !isCurrentlyLiked }));
    setCreations((prev) =>
      prev.map((c) => {
        if (c.id === item.id) {
          return {
            ...c,
            likesCount: isCurrentlyLiked ? Math.max(0, previousLikesCount - 1) : previousLikesCount + 1,
          };
        }
        return c;
      })
    );

    try {
      const res = await fetch("/api/community/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creationId: item.id }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Like failed");
      }

      // Reconcile with server response
      setLikedPosts((prev) => ({ ...prev, [item.id]: data.data.hasLiked }));
      setCreations((prev) =>
        prev.map((c) => (c.id === item.id ? { ...c, likesCount: data.data.likesCount } : c))
      );
    } catch {
      // Rollback on network error
      setLikedPosts((prev) => ({ ...prev, [item.id]: isCurrentlyLiked }));
      setCreations((prev) =>
        prev.map((c) => (c.id === item.id ? { ...c, likesCount: previousLikesCount } : c))
      );
      toast.error("Failed to update like");
    }
  };

  // Share handler
  const handleShare = (item: PublicCreation) => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    navigator.clipboard.writeText(url);
    setCopiedId(item.id);
    toast.success("Community link copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = [
    { id: "all", label: "All Items", count: creations.length },
    { id: "article", label: "✍️ Articles", count: creations.filter((c) => c.type === "article").length },
    { id: "image", label: "🎨 AI Images", count: creations.filter((c) => c.type === "image").length },
    { id: "blog-title", label: "🏷️ Blog Titles", count: creations.filter((c) => c.type === "blog-title").length },
    { id: "object-removal", label: "✂️ Inpaintings", count: creations.filter((c) => c.type === "object-removal").length },
    { id: "document-rag", label: "🧠 Hybrid RAG", count: creations.filter((c) => c.type === "document-rag").length },
  ];

  return (
    <div className="space-y-6">
      {/* Category Pills & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="overflow-x-auto flex items-center gap-2 pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-secondary/40 text-muted-foreground hover:text-white hover:bg-secondary/80 border border-border/40"
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeCategory === cat.id ? "bg-white/20 text-white" : "bg-secondary text-slate-400"
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search prompts or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-secondary/60 border border-border/60 text-white text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Public Feed Cards Grid */}
      {filteredFeed.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center flex flex-col items-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">No Creations Found</h3>
          <p className="text-xs text-muted-foreground mt-1 text-center">
            {searchQuery ? "No public posts match your search query." : "Be the first to publish an article or AI image to the community!"}
          </p>
          <Link
            href="/studio/article"
            className="mt-5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all"
          >
            Create in Studio
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeed.map((item) => {
            const config = TYPE_CONFIG[item.type] || {
              label: item.type,
              icon: FileText,
              color: "text-slate-400 bg-secondary border-border/40",
            };
            const isLiked = likedPosts[item.id] || false;
            const hasImage = Boolean(item.imageUrl);

            return (
              <div
                key={item.id}
                className="glass-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between group hover:border-indigo-500/40 transition-all duration-300 relative overflow-hidden"
              >
                <div>
                  {/* Card Header: Type Badge & Date */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border shrink-0 ${config.color}`}
                    >
                      {config.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {formatDate(new Date(item.createdAt))}
                    </span>
                  </div>

                  {/* Image Preview if available */}
                  {hasImage && item.imageUrl && (
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-3.5 border border-border/50">
                      <Image
                        src={item.imageUrl}
                        alt={item.title || "Community Creation"}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Title & Prompt */}
                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {item.title || item.prompt.slice(0, 40)}
                  </h3>

                  <p className="text-xs text-muted-foreground mt-2 line-clamp-3 leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-border/30 font-mono text-[11px]">
                    "{item.prompt}"
                  </p>
                </div>

                {/* Card Footer: Social Like, Share & 1-Click Remix */}
                <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between gap-2">
                  {/* Like Button */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleLike(item)}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        isLiked
                          ? "bg-pink-500/15 border-pink-500/40 text-pink-400"
                          : "bg-secondary/60 border-border/40 text-muted-foreground hover:text-white"
                      }`}
                      title={isLiked ? "Unlike" : "Like this creation"}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 transition-transform active:scale-125 ${
                          isLiked ? "text-pink-500 fill-pink-500" : ""
                        }`}
                      />
                      <span>{item.likesCount || 0}</span>
                    </button>

                    <button
                      onClick={() => handleShare(item)}
                      className="p-1 rounded-lg text-muted-foreground hover:text-white transition-colors cursor-pointer"
                      title="Share link"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* 1-Click Remix Prompt Button */}
                  <button
                    onClick={() => handleRemix(item)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1 transition-all cursor-pointer shrink-0"
                  >
                    <Zap className="w-3 h-3" />
                    1-Click Remix
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
