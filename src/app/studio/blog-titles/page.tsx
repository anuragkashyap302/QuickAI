"use client";

import { useState, useEffect } from "react";
import { Hash, Sparkles, Copy, Check, Loader2, ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import Link from "next/link";

export default function BlogTitlesPage() {
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState("Technology");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTitles, setGeneratedTitles] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Hydrate remixed prompt from URL query params
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const remixPrompt = params.get("remixPrompt");
      if (remixPrompt) {
        setPrompt(remixPrompt);
        toast.success("✨ Remixed topic loaded from Community!");
      }
    }
  }, []);

  const categories = [
    "Technology",
    "Business & Startups",
    "Marketing & Growth",
    "Design & Creative",
    "Lifestyle & Wellness",
    "Personal Development",
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error("Please enter a keyword or topic");
      return;
    }

    setIsGenerating(true);
    setGeneratedTitles(null);

    try {
      const res = await fetch("/api/ai/blog-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, category }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to generate titles");

      setGeneratedTitles(json.data.content);
      toast.success("Catchy titles generated!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedTitles) return;
    navigator.clipboard.writeText(generatedTitles);
    setCopied(true);
    toast.success("Copied titles to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#B153EA] to-[#E549A3] flex items-center justify-center shadow-lg shadow-purple-500/20 text-white">
            <Hash className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Blog Title Generator</h1>
            <p className="text-sm text-muted-foreground">
              Generate catchy, viral, SEO-friendly headline ideas for your blog posts.
            </p>
          </div>
        </div>

        {generatedTitles && (
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-white text-xs font-semibold border border-border flex items-center gap-2 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy Titles"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          <form onSubmit={handleGenerate} className="glass-panel rounded-2xl p-6 border border-border/60 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Keyword or Topic Outline <span className="text-pink-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. AI full-stack development, remote work habits"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-secondary/60 border border-border text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Industry Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-secondary/60 border border-border text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-[#11131a] text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#B153EA] to-[#E549A3] hover:opacity-95 disabled:opacity-50 text-white text-sm font-semibold shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Catchy Titles...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate 10 Titles (1 Credit)
                </>
              )}
            </button>
          </form>
        </div>

        <div className="lg:col-span-7">
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-border/60 min-h-[400px] flex flex-col justify-center">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-purple-400 mb-3" />
                <p className="text-sm">Crafting viral headlines with Gemini...</p>
              </div>
            ) : generatedTitles ? (
              <div className="prose prose-invert max-w-none prose-ol:text-slate-200 prose-li:my-1.5 prose-strong:text-purple-300">
                <ReactMarkdown>{generatedTitles}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
                <Hash className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <h3 className="text-sm font-semibold text-white">Your generated titles will appear here</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Enter your topic and click generate to get 10 high-CTR headlines.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
