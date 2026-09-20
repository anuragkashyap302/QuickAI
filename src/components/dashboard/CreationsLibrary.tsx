"use client";

import { useState } from "react";
import {
  Clock,
  Search,
  Filter,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  FileText,
  FileCheck2,
  SquarePen,
  Hash,
  Image as ImageIcon,
  Scissors,
  Eraser,
  Cpu,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

export interface CreationItem {
  id: number;
  type: string;
  title: string | null;
  prompt: string;
  content: string;
  imageUrl?: string | null;
  createdAt: Date | string;
}

const TYPE_CONFIG: { [key: string]: { label: string; icon: typeof FileText; color: string } } = {
  article: { label: "Article", icon: SquarePen, color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  "blog-title": { label: "Blog Titles", icon: Hash, color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
  image: { label: "AI Image", icon: ImageIcon, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  "remove-background": { label: "BG Removal", icon: Eraser, color: "text-orange-400 bg-orange-500/10 border-orange-500/30" },
  "object-removal": { label: "Inpaint Object", icon: Scissors, color: "text-rose-400 bg-rose-500/10 border-rose-500/30" },
  "resume-review": { label: "Resume ATS", icon: FileCheck2, color: "text-teal-400 bg-teal-500/10 border-teal-500/30" },
  "document-rag": { label: "Hybrid RAG Doc", icon: Cpu, color: "text-pink-400 bg-pink-500/10 border-pink-500/30" },
};

export function CreationsLibrary({ initialCreations = [] }: { initialCreations: CreationItem[] }) {
  const [creationsList, setCreationsList] = useState<CreationItem[]>(initialCreations);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Filtered Creations
  const filteredCreations = creationsList.filter((item) => {
    const matchesFilter =
      activeFilter === "all" ||
      item.type.toLowerCase().includes(activeFilter.toLowerCase());

    const matchesSearch =
      (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.prompt && item.prompt.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const handleDeleteCreation = async (id: number) => {
    try {
      const res = await fetch(`/api/user/creations?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Delete failed");

      setCreationsList((prev) => prev.filter((c) => c.id !== id));
      toast.success("Creation removed from library");
    } catch {
      toast.error("Failed to delete creation");
    }
  };

  const handleCopyContent = (item: CreationItem) => {
    navigator.clipboard.writeText(item.content || item.prompt);
    setCopiedId(item.id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = [
    { id: "all", label: "All Items", count: creationsList.length },
    { id: "article", label: "✍️ Articles", count: creationsList.filter((c) => c.type === "article").length },
    { id: "document-rag", label: "🧠 Hybrid RAG", count: creationsList.filter((c) => c.type === "document-rag").length },
    { id: "image", label: "🎨 AI Images", count: creationsList.filter((c) => c.type === "image").length },
    { id: "object-removal", label: "✂️ Inpainting", count: creationsList.filter((c) => c.type === "object-removal").length },
    { id: "resume-review", label: "📄 Resume ATS", count: creationsList.filter((c) => c.type === "resume-review").length },
  ];

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-border/60 space-y-6">
      {/* Top Header & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Your Creation Library</h2>
            <p className="text-xs text-muted-foreground">
              {creationsList.length} items persisted in Neon PostgreSQL
            </p>
          </div>
        </div>

        {/* Live Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search creations or prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-secondary/60 border border-border/60 text-white text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="overflow-x-auto flex items-center gap-2 pb-2 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveFilter(cat.id)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeFilter === cat.id
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-secondary/40 text-muted-foreground hover:text-white hover:bg-secondary/80 border border-border/40"
            }`}
          >
            <span>{cat.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeFilter === cat.id ? "bg-white/20 text-white" : "bg-secondary text-slate-400"
              }`}
            >
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Creations List Table / Stream */}
      {filteredCreations.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-secondary/60 flex items-center justify-center text-muted-foreground mb-3">
            <FolderOpen className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-semibold text-white">No creations match your query</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            {searchQuery ? "Try a different search keyword or filter." : "Launch one of the AI studios to create your first asset!"}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border/40">
          {filteredCreations.map((item) => {
            const config = TYPE_CONFIG[item.type] || {
              label: item.type,
              icon: FileText,
              color: "text-slate-400 bg-secondary border-border/40",
            };
            const Icon = config.icon;

            return (
              <div
                key={item.id}
                className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-secondary/20 px-3 rounded-2xl transition-colors group"
              >
                {/* Left side details */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${config.color}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white truncate">
                        {item.title || "Untitled Creation"}
                      </h4>
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border shrink-0 ${config.color}`}
                      >
                        {config.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {item.prompt}
                    </p>
                  </div>
                </div>

                {/* Right side actions */}
                <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                  <span className="text-xs text-muted-foreground font-mono">
                    {formatDate(new Date(item.createdAt))}
                  </span>

                  <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopyContent(item)}
                      className="p-1.5 rounded-lg bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-white transition-colors cursor-pointer"
                      title="Copy content"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => handleDeleteCreation(item.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Delete creation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
