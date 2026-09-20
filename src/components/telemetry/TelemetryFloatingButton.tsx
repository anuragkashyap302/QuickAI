"use client";

import React from "react";
import { useTelemetry } from "@/context/TelemetryContext";
import { Activity, Sparkles, Zap } from "lucide-react";

export function TelemetryFloatingButton() {
  const { isMounted, traces, setDrawerOpen, isDrawerOpen } = useTelemetry();

  if (!isMounted || isDrawerOpen) return null;

  return (
    <button
      onClick={() => setDrawerOpen(true)}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-zinc-900/90 hover:bg-zinc-850 border border-white/15 hover:border-emerald-500/50 shadow-2xl shadow-black/80 backdrop-blur-md group transition-all duration-200 hover:scale-105 active:scale-95"
      title="Open Real-Time LLM Observability & Developer Telemetry Drawer"
    >
      <div className="relative flex items-center justify-center">
        <Activity className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-xs font-bold text-white tracking-tight">Observability</span>
        <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white/10 text-zinc-300 rounded-full border border-white/10">
          {traces.length}
        </span>
      </div>
    </button>
  );
}
