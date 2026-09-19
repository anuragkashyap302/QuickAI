"use client";

import { useState, useRef } from "react";
import {
  PenTool,
  Sparkles,
  Send,
  Copy,
  Check,
  Download,
  Printer,
  FileText,
  Table as TableIcon,
  Globe,
  Search,
  CheckCheck,
  Maximize2,
  Edit3,
  Eye,
  Loader2,
  Heading1,
  Heading2,
  Bold,
  Italic,
  List,
  Quote,
  Code,
  Zap,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

const TONE_OPTIONS = [
  { id: "Professional", label: "💼 Professional", desc: "Crisp & authoritative" },
  { id: "Persuasive", label: "⚡ Persuasive", desc: "Compelling & action-driven" },
  { id: "Casual", label: "☕ Casual", desc: "Approachable & conversational" },
  { id: "Academic", label: "🎓 Academic", desc: "Rigorous & analytical" },
  { id: "Storytelling", label: "📖 Storytelling", desc: "Narrative & engaging" },
  { id: "Viral", label: "🚀 Viral", desc: "High-hook & shareable" },
];

const AUDIENCE_OPTIONS = [
  "General Audience",
  "Software Engineers & AI Devs",
  "Startup Founders & Tech Leaders",
  "C-Suite Executives & VCs",
  "Product Designers & Creators",
];

const TRANSLATION_LANGUAGES = ["Spanish", "French", "Hindi", "German", "Japanese"];

export default function ArticleStudioPage() {
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [tone, setTone] = useState("Professional");
  const [targetAudience, setTargetAudience] = useState("Software Engineers & AI Devs");
  const [keywords, setKeywords] = useState("");
  const [length, setLength] = useState(800);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefactoring, setIsRefactoring] = useState(false);
  const [refactorAction, setRefactorAction] = useState<string | null>(null);
  const [generatedArticle, setGeneratedArticle] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<"preview" | "editor">("preview");
  const [selectedLanguage, setSelectedLanguage] = useState("Spanish");
  const [copied, setCopied] = useState(false);

  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Statistics calculation
  const wordCount = generatedArticle
    ? generatedArticle.trim().split(/\s+/).filter(Boolean).length
    : 0;
  const readingTime = Math.ceil(wordCount / 200) || 1;
  const charCount = generatedArticle ? generatedArticle.length : 0;

  // Initial Full Article Generation
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error("Please enter a topic outline");
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
          title: title || prompt.slice(0, 50),
          length,
          tone,
          targetAudience,
          keywords,
          publish: true,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to generate article");
      }

      setGeneratedArticle(json.data.content);
      setViewMode("preview");
      toast.success("Article generated successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  // In-Line 1-Click AI Transformation Handler
  const handleRefactor = async (action: "punchy" | "table" | "translate" | "seo" | "grammar" | "expand") => {
    if (!generatedArticle) return;

    setIsRefactoring(true);
    setRefactorAction(action);
    const toastId = toast.loading(`Applying AI refactor: ${action}...`);

    try {
      const res = await fetch("/api/ai/article/refactor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: generatedArticle,
          action,
          targetLanguage: action === "translate" ? selectedLanguage : undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Refactor failed");
      }

      setGeneratedArticle(json.data.content);
      toast.success(`Applied ${action} transformation! (1 Credit)`, { id: toastId });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Refactor error";
      toast.error(msg, { id: toastId });
    } finally {
      setIsRefactoring(false);
      setRefactorAction(null);
    }
  };

  // Formatting Toolbar Helper for Editor Mode
  const insertFormatting = (prefix: string, suffix = "") => {
    if (!editorRef.current || !generatedArticle) return;

    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = generatedArticle.substring(start, end) || "text";

    const updatedText =
      generatedArticle.substring(0, start) +
      prefix +
      selectedText +
      suffix +
      generatedArticle.substring(end);

    setGeneratedArticle(updatedText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 50);
  };

  // Insert Table Template
  const insertTable = () => {
    const tableTemplate = `\n\n| Feature / Metric | Approach A | Approach B | Advantage |\n| :--- | :--- | :--- | :--- |\n| Latency | 42ms | 120ms | 3x Faster |\n| Precision | 99.4% | 88.1% | 100% Grounded |\n| Cost per 1K | $0.001 | $0.005 | 80% Savings |\n\n`;
    setGeneratedArticle((prev) => (prev || "") + tableTemplate);
    toast.success("Table template added!");
  };

  // Export handlers
  const copyToClipboard = () => {
    if (!generatedArticle) return;
    navigator.clipboard.writeText(generatedArticle);
    setCopied(true);
    toast.success("Markdown copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMarkdownFile = () => {
    if (!generatedArticle) return;
    const blob = new Blob([generatedArticle], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(title || "article").toLowerCase().replace(/\s+/g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded .md file!");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs font-semibold mb-2">
            <PenTool className="w-3.5 h-3.5" />
            Phase 2 • Claude Artifacts Split Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">AI Content Creation & Artifacts Studio</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Generate long-form articles, refine with 1-click in-line AI transformations, and edit in dual-mode canvas.
          </p>
        </div>

        {generatedArticle && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="px-3 py-1.5 rounded-xl bg-secondary/80 hover:bg-secondary text-white text-xs font-medium border border-border/50 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy MD"}
            </button>

            <button
              onClick={downloadMarkdownFile}
              className="px-3 py-1.5 rounded-xl bg-secondary/80 hover:bg-secondary text-white text-xs font-medium border border-border/50 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              Download .md
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-secondary/80 hover:bg-secondary text-white text-xs font-medium border border-border/50 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              Print / PDF
            </button>
          </div>
        )}
      </div>

      {/* Main Split-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start min-h-[640px]">
        {/* LEFT PANE: Parameters & Prompt Studio (5 Cols) */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-5 sm:p-6 border border-border/40 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Article Parameters & Style
            </h2>
            <span className="text-[11px] text-muted-foreground font-mono">⚡ 1 Credit</span>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Article Title (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Next-Gen Enterprise AI Architecture in 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/60 border border-border/60 text-white text-xs sm:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Prompt Outline */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Topic & Key Outline Points <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="Describe what you want to write about, including specific sub-sections, target audience, and key metrics..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/60 border border-border/60 text-white text-xs sm:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              />
            </div>

            {/* Tone Selector Grid */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Tone of Voice
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TONE_OPTIONS.map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setTone(t.id)}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                      tone === t.id
                        ? "bg-indigo-600/20 border-indigo-500 text-white shadow-sm"
                        : "bg-secondary/40 border-border/40 text-muted-foreground hover:text-slate-200 hover:bg-secondary/70"
                    }`}
                  >
                    <div className="text-xs font-bold">{t.label}</div>
                    <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 truncate">
                      {t.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Audience & Keywords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Target Audience
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-secondary/60 border border-border/60 text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {AUDIENCE_OPTIONS.map((aud) => (
                    <option key={aud} value={aud} className="bg-slate-900 text-white">
                      {aud}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Word Length (~tokens)
                </label>
                <select
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-secondary/60 border border-border/60 text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value={500}>Short Form (~500 tokens)</option>
                  <option value={800}>Standard (~800 tokens)</option>
                  <option value={1500}>Long-Form (~1500 tokens)</option>
                </select>
              </div>
            </div>

            {/* SEO Keywords */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Target SEO Keywords (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. pgvector, next.js 15, hybrid rag, sub-50ms"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-secondary/60 border border-border/60 text-white text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Generate Button */}
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Synthesizing with Gemini 2.5 Flash...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Full Article (1 Credit)
                </>
              )}
            </button>
          </form>
        </div>

        {/* RIGHT PANE: Claude Artifacts Dual-Mode Content Canvas (7 Cols) */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-5 sm:p-6 border border-border/40 flex flex-col h-[680px]">
          {/* Canvas Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
            {/* Mode Switcher */}
            <div className="flex items-center gap-1.5 bg-secondary/60 p-1 rounded-xl border border-border/50">
              <button
                type="button"
                onClick={() => setViewMode("preview")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === "preview"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Live Preview
              </button>
              <button
                type="button"
                onClick={() => setViewMode("editor")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === "editor"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                Markdown Editor
              </button>
            </div>

            {/* Document Telemetry Counters */}
            {generatedArticle && (
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono">
                <span>{wordCount} Words</span>
                <span>•</span>
                <span>~{readingTime} min read</span>
                <span>•</span>
                <span>{charCount} Chars</span>
              </div>
            )}
          </div>

          {/* In-Line 1-Click AI Transformation Suite (Available when article exists) */}
          {generatedArticle && (
            <div className="py-2.5 border-b border-border/40 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
              <span className="text-[10px] uppercase font-bold text-indigo-400 shrink-0 mr-1 flex items-center gap-1">
                <Zap className="w-3 h-3" /> AI Tools:
              </span>

              <button
                onClick={() => handleRefactor("punchy")}
                disabled={isRefactoring}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-secondary/60 hover:bg-indigo-600/20 hover:text-indigo-300 border border-border/40 text-[11px] text-slate-200 transition-all shrink-0 cursor-pointer disabled:opacity-40"
              >
                ⚡ Make Punchier
              </button>

              <button
                onClick={() => handleRefactor("table")}
                disabled={isRefactoring}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-secondary/60 hover:bg-indigo-600/20 hover:text-indigo-300 border border-border/40 text-[11px] text-slate-200 transition-all shrink-0 cursor-pointer disabled:opacity-40"
              >
                📊 Add Table
              </button>

              <button
                onClick={() => handleRefactor("seo")}
                disabled={isRefactoring}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-secondary/60 hover:bg-indigo-600/20 hover:text-indigo-300 border border-border/40 text-[11px] text-slate-200 transition-all shrink-0 cursor-pointer disabled:opacity-40"
              >
                🔍 Generate SEO Meta
              </button>

              <button
                onClick={() => handleRefactor("grammar")}
                disabled={isRefactoring}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-secondary/60 hover:bg-indigo-600/20 hover:text-indigo-300 border border-border/40 text-[11px] text-slate-200 transition-all shrink-0 cursor-pointer disabled:opacity-40"
              >
                📝 Polish Flow
              </button>

              {/* Translate dropdown */}
              <div className="flex items-center gap-1 shrink-0">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-secondary/60 border border-border/40 text-[11px] text-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {TRANSLATION_LANGUAGES.map((lang) => (
                    <option key={lang} value={lang} className="bg-slate-900 text-white">
                      {lang}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleRefactor("translate")}
                  disabled={isRefactoring}
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-40"
                >
                  🌐 Translate
                </button>
              </div>
            </div>
          )}

          {/* Formatting Toolbar (Only in Editor Mode) */}
          {viewMode === "editor" && generatedArticle && (
            <div className="py-2 border-b border-border/40 flex flex-wrap items-center gap-1">
              <button
                type="button"
                onClick={() => insertFormatting("# ")}
                className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-white"
                title="Heading 1"
              >
                <Heading1 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("## ")}
                className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-white"
                title="Heading 2"
              >
                <Heading2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("**", "**")}
                className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-white font-bold"
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("*", "*")}
                className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-white italic"
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("- ")}
                className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-white"
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("> ")}
                className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-white"
                title="Blockquote"
              >
                <Quote className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("```\n", "\n```")}
                className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-white"
                title="Code Block"
              >
                <Code className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={insertTable}
                className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-white"
                title="Insert Table"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Canvas Content Body */}
          <div className="flex-1 overflow-y-auto py-4 pr-1 relative">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                <p className="text-sm font-semibold text-white">Synthesizing Content with Gemini 2.5 Flash...</p>
                <p className="text-xs text-muted-foreground">Applying tone: {tone} • Audience: {targetAudience}</p>
              </div>
            ) : isRefactoring ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                <p className="text-sm font-semibold text-white">Refactoring Content ({refactorAction})...</p>
                <p className="text-xs text-muted-foreground">Preserving structure & formatting</p>
              </div>
            ) : !generatedArticle ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground">
                <FileText className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <h3 className="text-sm font-semibold text-white">Artifacts Canvas Ready</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
                  Configure your parameters on the left and click <strong>Generate Full Article</strong> to start creating.
                </p>
              </div>
            ) : viewMode === "editor" ? (
              <textarea
                ref={editorRef}
                value={generatedArticle}
                onChange={(e) => setGeneratedArticle(e.target.value)}
                className="w-full h-full bg-transparent text-slate-200 font-mono text-xs sm:text-sm p-2 focus:outline-none resize-none leading-relaxed"
                placeholder="Write or edit markdown directly here..."
              />
            ) : (
              <div className="prose prose-invert max-w-none prose-headings:text-white prose-headings:font-bold prose-h1:text-xl sm:prose-h1:text-2xl prose-h2:text-lg prose-p:text-slate-300 prose-p:leading-relaxed prose-li:text-slate-300 prose-strong:text-indigo-300 prose-table:border prose-table:border-border/50 prose-th:bg-secondary/60 prose-td:border-border/40">
                <ReactMarkdown>{generatedArticle}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
