"use client";

import { useState } from "react";
import { PenTool, Sparkles, Send, Copy, Check, FileDown, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

/**
 * Article Studio (Client Component)
 * 
 * Flow:
 * 1. User prompt type karta hai
 * 2. Form submit hone par `/api/ai/article` call hota hai
 * 3. Drizzle DB me save hota hai aur live preview render hota hai
 */
export default function ArticleStudioPage() {
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [length, setLength] = useState(800);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedArticle, setGeneratedArticle] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error("Please enter a topic or prompt");
      return;
    }

    setIsGenerating(true);
    setGeneratedArticle(null);

    try {
      const res = await fetch("/api/ai/article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          title: title || prompt.slice(0, 40),
          length,
          publish: true,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to generate article");
      }

      setGeneratedArticle(json.data.content);
      toast.success("Article generated and saved to history!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedArticle) return;
    navigator.clipboard.writeText(generatedArticle);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-border/40">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30 text-xs font-semibold mb-2">
            <PenTool className="w-3.5 h-3.5" />
            Article Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">AI Content Generation Studio</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Generate high-ranking long-form articles, essays, and documentation powered by Gemini 2.5 Flash.
          </p>
        </div>

        {generatedArticle && (
          <div className="flex items-center gap-3">
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-white text-xs font-medium border border-border flex items-center gap-2 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy Markdown"}
            </button>
          </div>
        )}
      </div>

      {/* Split Pane Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Pane: Prompt Controls */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleGenerate} className="glass-panel rounded-2xl p-6 border border-border/60 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Article Title (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Modern Full-Stack AI System Design"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-secondary/60 border border-border text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Prompt / Topic Outline <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={5}
                required
                placeholder="Describe what you want to write about in detail, including target audience and key takeaways..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-secondary/60 border border-border text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Target Word Length (~{length} tokens)
              </label>
              <select
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-secondary/60 border border-border text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value={500}>Short Form (~500 tokens)</option>
                <option value={800}>Standard Article (~800 tokens)</option>
                <option value={1500}>Long-Form Deep Dive (~1500 tokens)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 disabled:opacity-50 text-white text-sm font-semibold shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating with Gemini...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Article (1 Credit)
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Pane: Generated Preview / WYSIWYG */}
        <div className="lg:col-span-7">
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-border/60 min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/40">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Article Live Preview
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Markdown Engine
              </span>
            </div>

            {isGenerating ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mb-3" />
                <p className="text-sm">Synthesizing content with Gemini 2.5 Flash...</p>
              </div>
            ) : generatedArticle ? (
              <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-slate-300 prose-li:text-slate-300 prose-strong:text-indigo-300">
                <ReactMarkdown>{generatedArticle}</ReactMarkdown>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                <PenTool className="w-10 h-10 text-muted-foreground/40 mb-3" />
                <h3 className="text-sm font-semibold text-white">Your generated article will appear here</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Fill in the prompt on the left and click Generate to start.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
