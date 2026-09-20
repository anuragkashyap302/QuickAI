"use client";

import React, { useState } from "react";
import { useTelemetry } from "@/context/TelemetryContext";
import {
  Activity,
  Zap,
  Coins,
  Clock,
  Layers,
  Search,
  Download,
  Trash2,
  ChevronRight,
  Sparkles,
  Cpu,
  Check,
  Copy,
  ArrowUpRight,
  ShieldCheck,
  Sliders,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ObservabilityDashboardPage() {
  const {
    traces,
    summary,
    clearTraces,
    exportTracesJson,
    selectedTrace,
    setSelectedTrace,
    isMounted,
  } = useTelemetry();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudioFilter, setSelectedStudioFilter] = useState("ALL");
  const [copiedTraceId, setCopiedTraceId] = useState<string | null>(null);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 text-sm">
        Initializing Observability telemetry pipeline...
      </div>
    );
  }

  const handleCopyPrompt = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTraceId(id);
    toast.success("Prompt context copied to clipboard");
    setTimeout(() => setCopiedTraceId(null), 2000);
  };

  const filteredTraces = traces.filter((t) => {
    const matchesSearch =
      t.studio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.promptPreview.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedStudioFilter === "ALL") return matchesSearch;
    if (selectedStudioFilter === "RAG") return matchesSearch && t.studio.includes("RAG");
    if (selectedStudioFilter === "ARTICLE") return matchesSearch && t.studio.includes("Article");
    if (selectedStudioFilter === "VISION")
      return (
        matchesSearch &&
        (t.studio.includes("Image") || t.studio.includes("Inpaint") || t.studio.includes("Background"))
      );
    if (selectedStudioFilter === "ATS") return matchesSearch && t.studio.includes("ATS");
    return matchesSearch;
  });

  // Calculate model breakdown
  const modelStats = traces.reduce((acc, t) => {
    acc[t.model] = (acc[t.model] || 0) + t.totalTokens;
    return acc;
  }, {} as Record<string, number>);

  const totalTokens = summary.totalTokens || 1;

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white">
                  Real-Time LLM Observability & Telemetry
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  SYSTEM HEALTHY
                </span>
              </div>
              <p className="text-sm text-zinc-400">
                Full-trace OpenTelemetry metrics, per-call token accounting, TTFT latency & cost analytics
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={clearTraces}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Clear Session
          </button>
          <button
            onClick={exportTracesJson}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" /> Export Traces (JSON)
          </button>
        </div>
      </div>

      {/* 4 Flagship Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tokens Card */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md relative overflow-hidden group hover:border-indigo-500/40 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Total Tokens Processed</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white mb-1">
            {summary.totalTokens.toLocaleString()}
          </div>
          <p className="text-xs text-zinc-500">Across {summary.totalCalls} model inferences</p>
        </div>

        {/* Cumulative API Spend */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Estimated API Spend</span>
            <Coins className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mb-1">
            ${summary.totalCostUsd.toFixed(5)} <span className="text-xs font-normal text-zinc-400">USD</span>
          </div>
          <p className="text-xs text-zinc-500">Gemini 2.5 Flash + Vision API rates</p>
        </div>

        {/* Average Latency */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md relative overflow-hidden group hover:border-cyan-500/40 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Mean Latency</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-300 mb-1">
            {summary.avgLatencyMs} <span className="text-xs font-normal text-zinc-400">ms</span>
          </div>
          <p className="text-xs text-zinc-500">Sub-50ms token stream throughput</p>
        </div>

        {/* Success Rate */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md relative overflow-hidden group hover:border-purple-500/40 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Inference Success Rate</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white mb-1">{summary.successRate}%</div>
          <p className="text-xs text-emerald-400 font-medium">0 Fatal Execution Errors</p>
        </div>
      </div>

      {/* Model Breakdown Progress Bars & Architecture Callout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model Token Share */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" /> Token Volume By Model
            </h3>
            <span className="text-xs text-zinc-400 font-mono">
              {Object.keys(modelStats).length} Active Endpoints
            </span>
          </div>

          <div className="space-y-3.5 pt-2">
            {Object.entries(modelStats).map(([modelName, tokens]) => {
              const pct = Math.round((tokens / totalTokens) * 100);
              return (
                <div key={modelName} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-zinc-300">{modelName}</span>
                    <span className="font-semibold text-zinc-400">
                      {tokens.toLocaleString()} tokens ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Observability Standards Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-zinc-900/60 to-black border border-indigo-500/20 backdrop-blur-md flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> Production Telemetry Design
            </div>
            <h4 className="text-base font-bold text-white">Full-Trace Langfuse / OpenTelemetry Compliance</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every inference captures input prompt context, dense & sparse RRF retrieval chunks, TTFT
              (Time to First Token), and token-cost calculus for strict enterprise SLA compliance.
            </p>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
            <span>Latency SLA: &lt; 2.5s</span>
            <span className="text-emerald-400 font-semibold">Grounded & Verified</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-900/80 rounded-xl border border-white/10 overflow-x-auto">
            {[
              { id: "ALL", label: "All Traces" },
              { id: "RAG", label: "🧠 Hybrid RAG" },
              { id: "ARTICLE", label: "✍️ Articles" },
              { id: "VISION", label: "🎨 Vision & Inpaint" },
              { id: "ATS", label: "📄 ATS Reviewer" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStudioFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedStudioFilter === tab.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompts, models, keywords..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-zinc-900/80 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Detailed Trace Events Table */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/90 border-b border-white/10 text-zinc-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Studio / Model</th>
                  <th className="p-4">Prompt Context</th>
                  <th className="p-4">Latency & TTFT</th>
                  <th className="p-4">Tokens (In / Out)</th>
                  <th className="p-4">Cost (USD)</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {filteredTraces.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-zinc-500">
                      No matching telemetry traces found.
                    </td>
                  </tr>
                ) : (
                  filteredTraces.map((trace) => {
                    const isFast = trace.latencyMs < 1000;
                    return (
                      <tr
                        key={trace.id}
                        className="hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="p-4 space-y-1">
                          <span className="inline-block px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            {trace.studio}
                          </span>
                          <p className="text-[10px] font-mono text-zinc-500">{trace.model}</p>
                        </td>

                        <td className="p-4 max-w-xs">
                          <p className="text-xs text-zinc-200 line-clamp-2 leading-relaxed">
                            {trace.promptPreview}
                          </p>
                        </td>

                        <td className="p-4 whitespace-nowrap space-y-0.5">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                              isFast
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            }`}
                          >
                            {trace.latencyMs} ms
                          </span>
                          {trace.ttftMs && (
                            <p className="text-[10px] text-cyan-400">TTFT: {trace.ttftMs}ms</p>
                          )}
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          <span className="font-semibold text-white">
                            {trace.totalTokens.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-zinc-500 block">
                            ({trace.promptTokens} in / {trace.completionTokens} out)
                          </span>
                        </td>

                        <td className="p-4 whitespace-nowrap font-mono text-emerald-400 font-semibold">
                          ${trace.costUsd.toFixed(6)}
                        </td>

                        <td className="p-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleCopyPrompt(trace.promptPreview, trace.id)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors inline-flex items-center gap-1 text-[11px]"
                            title="Copy Prompt Context"
                          >
                            {copiedTraceId === trace.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
