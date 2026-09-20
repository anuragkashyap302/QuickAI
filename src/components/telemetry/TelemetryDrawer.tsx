"use client";

import React, { useState } from "react";
import { useTelemetry } from "@/context/TelemetryContext";
import {
  X,
  Zap,
  Activity,
  Coins,
  Clock,
  Download,
  Trash2,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
  Copy,
  Check,
  Code2,
  FileText,
  Search,
} from "lucide-react";
import { toast } from "sonner";

export function TelemetryDrawer() {
  const {
    traces,
    isDrawerOpen,
    setDrawerOpen,
    selectedTrace,
    setSelectedTrace,
    summary,
    clearTraces,
    exportTracesJson,
    isMounted,
  } = useTelemetry();

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState("");

  if (!isMounted || !isDrawerOpen) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`Copied ${field} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const filteredTraces = traces.filter(
    (t) =>
      t.studio.toLowerCase().includes(filterQuery.toLowerCase()) ||
      t.model.toLowerCase().includes(filterQuery.toLowerCase()) ||
      t.promptPreview.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div
        className="absolute inset-0"
        onClick={() => setDrawerOpen(false)}
      />

      {/* Slide-out Drawer Panel */}
      <div className="relative w-full max-w-2xl h-full bg-zinc-950/95 border-l border-white/10 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-zinc-900/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Activity className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  LLM Observability Drawer
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full">
                  LIVE TRACING
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Real-time token metrics, latency breakdown & per-call cost telemetry
              </p>
            </div>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-4 gap-2 p-4 bg-zinc-900/40 border-b border-white/5 text-xs">
          <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
            <span className="text-[11px] text-zinc-400 flex items-center gap-1 mb-1">
              <Zap className="w-3 h-3 text-amber-400" /> Calls
            </span>
            <span className="text-sm font-bold text-white">{summary.totalCalls}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
            <span className="text-[11px] text-zinc-400 flex items-center gap-1 mb-1">
              <Layers className="w-3 h-3 text-indigo-400" /> Tokens
            </span>
            <span className="text-sm font-bold text-white">
              {summary.totalTokens.toLocaleString()}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
            <span className="text-[11px] text-zinc-400 flex items-center gap-1 mb-1">
              <Coins className="w-3 h-3 text-emerald-400" /> Est. Spend
            </span>
            <span className="text-sm font-bold text-emerald-400">
              ${summary.totalCostUsd.toFixed(5)}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
            <span className="text-[11px] text-zinc-400 flex items-center gap-1 mb-1">
              <Clock className="w-3 h-3 text-cyan-400" /> Avg Latency
            </span>
            <span className="text-sm font-bold text-cyan-300">
              {summary.avgLatencyMs} ms
            </span>
          </div>
        </div>

        {/* Selected Trace Detail or Trace List */}
        {selectedTrace ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Back Button */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <button
                onClick={() => setSelectedTrace(null)}
                className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                ← Back to Trace Stream
              </button>
              <span className="text-xs font-mono text-zinc-500">ID: {selectedTrace.id}</span>
            </div>

            {/* Trace Header Info */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {selectedTrace.studio}
                </span>
                <span className="text-xs font-mono text-emerald-400 font-semibold">
                  ${selectedTrace.costUsd.toFixed(6)} USD
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                <div>
                  <span className="text-zinc-500 block text-[10px]">MODEL</span>
                  <span className="text-zinc-300 font-mono text-[11px] font-medium">
                    {selectedTrace.model}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">TOTAL LATENCY</span>
                  <span className="text-zinc-300 font-semibold">{selectedTrace.latencyMs} ms</span>
                  {selectedTrace.ttftMs && (
                    <span className="text-[10px] text-cyan-400 block">
                      TTFT: {selectedTrace.ttftMs} ms
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">TOKENS (IN/OUT)</span>
                  <span className="text-zinc-300 font-semibold">
                    {selectedTrace.promptTokens} / {selectedTrace.completionTokens} ({selectedTrace.totalTokens})
                  </span>
                </div>
              </div>
            </div>

            {/* Prompt Block */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-zinc-400" /> Prompt & Input Context
                </span>
                <button
                  onClick={() => handleCopy(selectedTrace.promptPreview, "Prompt")}
                  className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1"
                >
                  {copiedField === "Prompt" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  Copy
                </button>
              </div>
              <div className="p-3.5 rounded-xl bg-black/60 border border-white/5 text-xs font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {selectedTrace.promptPreview}
              </div>
            </div>

            {/* Response Output Block */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Model Response
                </span>
                <button
                  onClick={() => handleCopy(selectedTrace.responsePreview, "Response")}
                  className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1"
                >
                  {copiedField === "Response" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  Copy
                </button>
              </div>
              <div className="p-3.5 rounded-xl bg-black/60 border border-white/5 text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {selectedTrace.responsePreview}
              </div>
            </div>

            {/* Metadata / Retrieval Info if any */}
            {selectedTrace.metadata && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-cyan-400" /> Execution Metadata & RRF Chunks
                </span>
                <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 text-[11px] font-mono text-zinc-400 whitespace-pre-wrap">
                  {JSON.stringify(selectedTrace.metadata, null, 2)}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Search Filter */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter by studio, model or prompt keyword..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Traces Feed */}
            {filteredTraces.length === 0 ? (
              <div className="text-center py-16 text-zinc-500 text-xs">
                No telemetry traces matching query.
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredTraces.map((trace) => {
                  const isFast = trace.latencyMs < 1000;
                  return (
                    <div
                      key={trace.id}
                      onClick={() => setSelectedTrace(trace)}
                      className="group p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/20 transition-all cursor-pointer space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            {trace.studio}
                          </span>
                          <span className="text-[11px] font-mono text-zinc-400">
                            {trace.model}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                              isFast
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            }`}
                          >
                            {trace.latencyMs} ms
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
                        </div>
                      </div>

                      <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                        {trace.promptPreview}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-white/[0.04]">
                        <div className="flex items-center gap-3">
                          <span>
                            Tokens: <strong className="text-zinc-300">{trace.totalTokens}</strong>
                          </span>
                          {trace.ttftMs && (
                            <span className="text-cyan-400">
                              TTFT: <strong>{trace.ttftMs}ms</strong>
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-emerald-400 font-semibold">
                          ${trace.costUsd.toFixed(6)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-zinc-900/60 backdrop-blur-md flex items-center justify-between">
          <button
            onClick={clearTraces}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border border-rose-500/20"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Session
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={exportTracesJson}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Export Traces (JSON)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
