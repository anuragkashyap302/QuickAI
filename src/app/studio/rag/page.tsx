"use client";

import { useState, useEffect, useRef } from "react";
import {
  FileText,
  Sparkles,
  Search,
  Layers,
  Cpu,
  UploadCloud,
  Send,
  RefreshCw,
  Trash2,
  BookOpen,
  Activity,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ChevronRight,
  Database,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { SAMPLE_WHITEPAPER } from "@/lib/sample-docs";
import { useTelemetry } from "@/context/TelemetryContext";
import { estimateTokens } from "@/lib/telemetry";

interface DocumentItem {
  id: string;
  fileName: string;
  fileSize: number;
  status: string;
  createdAt: string;
}

interface DocumentChunkItem {
  id: string;
  chunkIndex: number;
  pageNumber: number;
  content: string;
}

interface RankedChunkTelemetry {
  id: string;
  chunkIndex: number;
  pageNumber: number;
  content: string;
  denseRank: number | null;
  sparseRank: number | null;
  denseScore: number;
  sparseScore: number;
  rrfScore: number;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  citedPages?: number[];
  rankedChunks?: RankedChunkTelemetry[];
}

export default function DocumentRagPage() {
  const [documentsList, setDocumentsList] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [docChunks, setDocChunks] = useState<DocumentChunkItem[]>([]);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [queryInput, setQueryInput] = useState("");
  const [loadingQuery, setLoadingQuery] = useState(false);
  const [activeTab, setActiveTab] = useState<"document" | "telemetry">("document");
  const [activeCitedPage, setActiveCitedPage] = useState<number | null>(null);
  const [lastTelemetry, setLastTelemetry] = useState<RankedChunkTelemetry[]>([]);

  const { addTrace } = useTelemetry();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content:
        "Welcome to **Sutra Document Intelligence & Hybrid RAG Engine**! 🧠\n\nUpload any PDF document or load our pre-indexed **Enterprise Architecture Whitepaper** to ask deep questions with **verifiable inline [Page X] citations** and live vector/lexical retrieval telemetry.",
      timestamp: "Just now",
    },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const chunkRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Fetch documents on load
  useEffect(() => {
    fetchDocuments();
  }, []);

  // When selected document changes, fetch its chunks
  useEffect(() => {
    if (selectedDocId) {
      fetchDocumentChunks(selectedDocId);
    }
  }, [selectedDocId]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loadingQuery]);

  // Auto-scroll document pane when a citation is clicked
  useEffect(() => {
    if (activeCitedPage !== null) {
      const targetChunk = docChunks.find((c) => c.pageNumber === activeCitedPage);
      if (targetChunk && chunkRefs.current[targetChunk.id]) {
        chunkRefs.current[targetChunk.id]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [activeCitedPage, docChunks]);

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/ai/rag/documents");
      const data = await res.json();
      if (data.success && data.data) {
        setDocumentsList(data.data);
        if (data.data.length > 0 && !selectedDocId) {
          setSelectedDocId(data.data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    }
  };

  const fetchDocumentChunks = async (docId: string) => {
    setLoadingDoc(true);
    try {
      const res = await fetch(`/api/ai/rag/documents?documentId=${docId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setDocChunks(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch chunks:", err);
    } finally {
      setLoadingDoc(false);
    }
  };

  // 1-Click Load Sample Whitepaper
  const handleLoadSampleWhitepaper = async () => {
    setUploading(true);
    const toastId = toast.loading("Ingesting & embedding Whitepaper with Gemini text-embedding-004...");
    try {
      const res = await fetch("/api/ai/rag/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(SAMPLE_WHITEPAPER),
      });

      const result = await res.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to ingest whitepaper");
      }

      toast.success("Whitepaper indexed with pgvector!", { id: toastId });
      await fetchDocuments();
      setSelectedDocId(result.data.documentId);
      
      // Add proactive suggestion message
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          role: "assistant",
          content: `✅ Successfully indexed **${result.data.fileName}** (${result.data.pageCount} pages, ${result.data.chunkCount} vector chunks).\n\nTry asking:\n- *"What is the Reciprocal Rank Fusion formula?"*\n- *"What are the sub-50ms latency benchmarks?"*\n- *"How does multi-tenant isolation work?"*`,
          timestamp: "Just now",
        },
      ]);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error(msg, { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  // PDF File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a valid PDF document");
      return;
    }

    setUploading(true);
    const toastId = toast.loading(`Parsing & indexing ${file.name}...`);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/ai/rag/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to process PDF");
      }

      toast.success("PDF parsed & vector indexed!", { id: toastId });
      await fetchDocuments();
      setSelectedDocId(result.data.documentId);

      setMessages((prev) => [
        ...prev,
        {
          id: `upload-${Date.now()}`,
          role: "assistant",
          content: `📄 **${result.data.fileName}** is ready! Indexed **${result.data.pageCount} pages** and **${result.data.chunkCount} semantic chunks** into Neon \`pgvector\`. Ask any question below.`,
          timestamp: "Just now",
        },
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload PDF";
      toast.error(msg, { id: toastId });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Delete active document
  const handleDeleteDocument = async () => {
    if (!selectedDocId) return;
    if (!confirm("Are you sure you want to delete this document and all its vector chunks?")) return;

    try {
      const res = await fetch(`/api/ai/rag/documents?documentId=${selectedDocId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Document deleted");
        setSelectedDocId("");
        setDocChunks([]);
        setLastTelemetry([]);
        fetchDocuments();
      }
    } catch {
      toast.error("Failed to delete document");
    }
  };

  // Submit Query to Hybrid RAG
  const handleSendQuery = async (queryText?: string) => {
    const textToSend = queryText || queryInput;
    if (!textToSend.trim() || !selectedDocId || loadingQuery) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setQueryInput("");
    setLoadingQuery(true);
    setActiveCitedPage(null);
    const startTime = performance.now();

    try {
      const res = await fetch("/api/ai/rag/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: selectedDocId,
          query: textToSend,
        }),
      });

      const result = await res.json();
      if (!result.success) {
        throw new Error(result.error || "Query failed");
      }

      const latencyMs = Math.round(performance.now() - startTime);
      const answer = result.data.answer;
      const promptTokens = estimateTokens(textToSend) + (docChunks.length * 200);
      const completionTokens = estimateTokens(answer);

      // Record to global telemetry drawer
      addTrace({
        studio: "Hybrid Document RAG",
        model: "gemini-2.5-flash + text-embedding-004",
        latencyMs,
        ttftMs: Math.round(latencyMs * 0.35),
        promptTokens,
        completionTokens,
        status: "success",
        promptPreview: textToSend,
        responsePreview: answer,
        metadata: {
          documentId: selectedDocId,
          chunksRetrieved: result.data.rankedChunks?.length || 0,
          citedPages: result.data.citedPages || [],
          hybridRRF: "Reciprocal Rank Fusion (k=60)",
        },
      });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: result.data.answer,
        timestamp: "Just now",
        citedPages: result.data.citedPages,
        rankedChunks: result.data.rankedChunks,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setLastTelemetry(result.data.rankedChunks || []);
    } catch (err: unknown) {
      const latencyMs = Math.round(performance.now() - startTime);
      const msg = err instanceof Error ? err.message : "Failed to generate answer";
      toast.error(msg);

      addTrace({
        studio: "Hybrid Document RAG",
        model: "gemini-2.5-flash",
        latencyMs,
        promptTokens: estimateTokens(textToSend),
        completionTokens: 0,
        status: "error",
        promptPreview: textToSend,
        responsePreview: msg,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: `⚠️ **Error:** ${msg}`,
          timestamp: "Just now",
        },
      ]);
    } finally {
      setLoadingQuery(false);
    }
  };

  // Render text with interactive citation badges
  const renderMessageContent = (content: string) => {
    // Regex matches [Page X] or [Page X, Page Y]
    const parts = content.split(/(\[Page \d+(?:, Page \d+)*\])/g);

    return (
      <div className="space-y-2 leading-relaxed text-sm">
        {parts.map((part, idx) => {
          const match = part.match(/\[Page (\d+)\]/);
          if (match) {
            const pageNum = parseInt(match[1], 10);
            return (
              <button
                key={idx}
                onClick={() => {
                  setActiveCitedPage(pageNum);
                  setActiveTab("document");
                  toast.info(`Scrolled to Page ${pageNum} source citation`);
                }}
                className={`inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-full text-xs font-mono font-bold transition-all ${
                  activeCitedPage === pageNum
                    ? "bg-amber-400 text-slate-950 ring-2 ring-amber-300 shadow-lg shadow-amber-500/20 scale-105"
                    : "bg-amber-500/15 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                }`}
                title={`Click to jump to Page ${pageNum} source`}
              >
                <BookOpen className="w-3 h-3" />
                Page {pageNum}
              </button>
            );
          }

          // Format bullet points or plain lines
          return <span key={idx}>{part}</span>;
        })}
      </div>
    );
  };

  const activeDoc = documentsList.find((d) => d.id === selectedDocId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30 text-xs font-semibold mb-2">
            <Cpu className="w-3.5 h-3.5" />
            Phase 6 Flagship Feature • Hybrid RAG (pgvector + BM25)
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Document Intelligence & Hybrid RAG Engine
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Reciprocal Rank Fusion (RRF $k=60$) search with sub-50ms citation-grounded answers.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf"
            className="hidden"
          />

          <button
            onClick={handleLoadSampleWhitepaper}
            disabled={uploading}
            className="px-3.5 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 text-violet-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            1-Click Load Whitepaper
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-rose-600/20 disabled:opacity-50"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            Upload PDF Document
          </button>
        </div>
      </div>

      {/* Active Document Selector & Stats Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-border/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground font-medium">Active Document:</label>
              {activeDoc && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              )}
            </div>
            {documentsList.length > 0 ? (
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="bg-secondary/60 border border-border/50 text-white text-xs rounded-lg px-2.5 py-1.5 mt-1 focus:outline-none focus:ring-1 focus:ring-rose-500 max-w-full truncate font-medium"
              >
                {documentsList.map((doc) => (
                  <option key={doc.id} value={doc.id} className="bg-slate-900 text-white">
                    {doc.fileName} ({(doc.fileSize / 1024).toFixed(0)} KB)
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-muted-foreground mt-0.5">
                No document loaded yet. Click <strong>1-Click Load Whitepaper</strong> or upload a PDF above.
              </p>
            )}
          </div>
        </div>

        {activeDoc && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0 self-end md:self-center">
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-rose-400" />
              <span>{docChunks.length} Chunks</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>768-dim Embeddings</span>
            </div>
            <button
              onClick={handleDeleteDocument}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Delete document"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main Dual-Pane Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start min-h-[620px]">
        {/* LEFT PANE: Grounded Chat & Citations (5 Cols) */}
        <div className="lg:col-span-6 glass-panel rounded-3xl p-5 border border-border/40 flex flex-col h-[650px]">
          {/* Chat Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <h2 className="text-sm font-bold text-white">Document Q&A & Citation Grounding</h2>
            </div>
            <span className="text-[11px] text-muted-foreground font-mono">⚡ 1 Credit / Query</span>
          </div>

          {/* Chat Messages Stream */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0 text-xs font-bold">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-rose-600 text-white rounded-br-none shadow-md shadow-rose-600/20"
                      : "glass-card border border-border/50 text-slate-200 rounded-tl-none"
                  }`}
                >
                  {msg.role === "user" ? msg.content : renderMessageContent(msg.content)}

                  {/* Cited page badges in message footer */}
                  {msg.citedPages && msg.citedPages.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                        Source Citations:
                      </span>
                      {msg.citedPages.map((p) => (
                        <button
                          key={p}
                          onClick={() => {
                            setActiveCitedPage(p);
                            setActiveTab("document");
                            toast.info(`Focused on Page ${p}`);
                          }}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all ${
                            activeCitedPage === p
                              ? "bg-amber-400 text-slate-950 font-bold"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                          }`}
                        >
                          📄 Page {p}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loadingQuery && (
              <div className="flex items-center gap-3 text-muted-foreground text-xs py-2">
                <div className="w-7 h-7 rounded-lg bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                </div>
                <span className="animate-pulse">
                  Querying pgvector dense index + BM25 full-text fusion...
                </span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Question Chips */}
          <div className="pt-2 pb-2 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
            {[
              "What is the Reciprocal Rank Fusion formula?",
              "What are the latency benchmarks (TTFT & Vector)?",
              "How is multi-tenant security enforced?",
            ].map((chip, idx) => (
              <button
                key={idx}
                disabled={!selectedDocId || loadingQuery}
                onClick={() => handleSendQuery(chip)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-secondary/60 hover:bg-rose-500/15 hover:text-rose-300 border border-border/40 text-[11px] text-muted-foreground transition-all shrink-0 disabled:opacity-40"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Query Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery();
            }}
            className="pt-2 border-t border-border/40 flex items-center gap-2"
          >
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder={
                selectedDocId
                  ? "Ask anything about this document..."
                  : "Load a document first to start chatting..."
              }
              disabled={!selectedDocId || loadingQuery}
              className="flex-1 bg-secondary/50 border border-border/50 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!queryInput.trim() || !selectedDocId || loadingQuery}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-rose-600/20 disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* RIGHT PANE: Dual-Tab Document Inspector & Telemetry Canvas (6 Cols) */}
        <div className="lg:col-span-6 glass-panel rounded-3xl p-5 border border-border/40 flex flex-col h-[650px]">
          {/* Tab Navigation */}
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("document")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === "document"
                    ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                    : "text-muted-foreground hover:text-white hover:bg-secondary/40"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Document Reader & Citations
              </button>
              <button
                onClick={() => setActiveTab("telemetry")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === "telemetry"
                    ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                    : "text-muted-foreground hover:text-white hover:bg-secondary/40"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                Hybrid RRF Telemetry ({lastTelemetry.length})
              </button>
            </div>

            {activeCitedPage && activeTab === "document" && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold animate-pulse">
                Focused: Page {activeCitedPage}
              </span>
            )}
          </div>

          {/* TAB 1: Document Chunks Viewer with Glowing Citation Highlights */}
          {activeTab === "document" && (
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {loadingDoc ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-rose-500" />
                  <span>Loading document chunks...</span>
                </div>
              ) : docChunks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground">
                  <FileText className="w-10 h-10 text-muted-foreground/40 mb-3" />
                  <p className="text-sm font-semibold text-white">No Document Selected</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    Select a document from the top bar or load the whitepaper to preview chunks.
                  </p>
                </div>
              ) : (
                docChunks.map((chunk) => {
                  const isCited = activeCitedPage === chunk.pageNumber;
                  return (
                    <div
                      key={chunk.id}
                      ref={(el) => {
                        chunkRefs.current[chunk.id] = el;
                      }}
                      className={`rounded-2xl p-4 transition-all duration-300 ${
                        isCited
                          ? "bg-amber-500/10 border-2 border-amber-400/90 shadow-xl shadow-amber-500/15 ring-2 ring-amber-400/50"
                          : "glass-card border border-border/40 hover:border-border/80"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                              isCited
                                ? "bg-amber-400 text-slate-950"
                                : "bg-secondary text-muted-foreground border border-border/50"
                            }`}
                          >
                            Page {chunk.pageNumber} • Chunk #{chunk.chunkIndex + 1}
                          </span>
                          {isCited && (
                            <span className="text-[10px] text-amber-300 font-bold flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> Cited Source
                            </span>
                          )}
                        </div>
                      </div>
                      <p
                        className={`text-xs leading-relaxed ${
                          isCited ? "text-amber-100 font-medium" : "text-slate-300"
                        }`}
                      >
                        {chunk.content}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: Hybrid RRF Search Telemetry */}
          {activeTab === "telemetry" && (
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              <div className="glass-card rounded-2xl p-4 border border-rose-500/20 bg-rose-500/5 text-xs text-slate-300 leading-relaxed space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-rose-400" />
                  Reciprocal Rank Fusion (RRF $k=60$) Pipeline
                </div>
                <p className="text-muted-foreground text-[11px]">
                  Dense cosine similarity queries in <code className="text-rose-300">pgvector</code> are combined with English dictionary BM25 lexical matches:
                </p>
                <div className="p-2 rounded-lg bg-slate-950 font-mono text-[11px] text-rose-300 border border-rose-500/20">
                  RRF_Score = 1/(60 + Dense_Rank) + 1/(60 + Sparse_Rank)
                </div>
              </div>

              {lastTelemetry.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center p-6 text-muted-foreground">
                  <Activity className="w-8 h-8 text-muted-foreground/40 mb-2" />
                  <p className="text-xs font-semibold text-white">No Telemetry Recorded</p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Ask a question in the chat to see real-time vector and lexical search rankings.
                  </p>
                </div>
              ) : (
                lastTelemetry.map((t, idx) => (
                  <div key={t.id || idx} className="glass-card rounded-2xl p-4 border border-border/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-white">
                          Page {t.pageNumber} • Chunk #{t.chunkIndex + 1}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold">
                        RRF: {t.rrfScore.toFixed(5)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded-xl bg-secondary/50 border border-border/40">
                        <span className="text-muted-foreground block text-[10px]">Dense pgvector Rank:</span>
                        <span className="font-bold text-emerald-400">
                          {t.denseRank ? `#${t.denseRank} (${(t.denseScore * 100).toFixed(1)}% Sim)` : "N/A"}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-secondary/50 border border-border/40">
                        <span className="text-muted-foreground block text-[10px]">Sparse BM25 Rank:</span>
                        <span className="font-bold text-amber-400">
                          {t.sparseRank ? `#${t.sparseRank} (Score: ${t.sparseScore.toFixed(2)})` : "N/A"}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-3 bg-slate-950/50 p-2.5 rounded-xl border border-border/30 font-mono text-[11px]">
                      {t.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
