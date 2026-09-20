"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import {
  TelemetryTrace,
  TelemetrySummary,
  INITIAL_SEED_TRACES,
  calculateCallCost,
} from "@/lib/telemetry";
import { toast } from "sonner";

interface TelemetryContextType {
  traces: TelemetryTrace[];
  addTrace: (
    trace: Omit<TelemetryTrace, "id" | "timestamp" | "costUsd" | "totalTokens"> & {
      id?: string;
      timestamp?: string;
      costUsd?: number;
      totalTokens?: number;
    }
  ) => void;
  clearTraces: () => void;
  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  selectedTrace: TelemetryTrace | null;
  setSelectedTrace: (trace: TelemetryTrace | null) => void;
  summary: TelemetrySummary;
  exportTracesJson: () => void;
  isMounted: boolean;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const [traces, setTraces] = useState<TelemetryTrace[]>(INITIAL_SEED_TRACES);
  const [isDrawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [selectedTrace, setSelectedTrace] = useState<TelemetryTrace | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = sessionStorage.getItem("sutra_telemetry_traces");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTraces(parsed);
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const addTrace = (
    traceInput: Omit<TelemetryTrace, "id" | "timestamp" | "costUsd" | "totalTokens"> & {
      id?: string;
      timestamp?: string;
      costUsd?: number;
      totalTokens?: number;
    }
  ) => {
    const totalTokens =
      traceInput.totalTokens ??
      (traceInput.promptTokens || 0) + (traceInput.completionTokens || 0);
    const costUsd =
      traceInput.costUsd ??
      calculateCallCost(
        traceInput.model,
        traceInput.promptTokens || 0,
        traceInput.completionTokens || 0
      );

    const newTrace: TelemetryTrace = {
      ...traceInput,
      id: traceInput.id || `tr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: traceInput.timestamp || new Date().toISOString(),
      totalTokens,
      costUsd,
    };

    setTraces((prev) => {
      const updated = [newTrace, ...prev];
      try {
        sessionStorage.setItem("sutra_telemetry_traces", JSON.stringify(updated.slice(0, 50)));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const clearTraces = () => {
    setTraces([]);
    setSelectedTrace(null);
    try {
      sessionStorage.removeItem("sutra_telemetry_traces");
    } catch {
      // ignore
    }
    toast.success("Telemetry session traces cleared");
  };

  const exportTracesJson = () => {
    try {
      const dataStr =
        "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(traces, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute(
        "download",
        `sutra-telemetry-traces-${new Date().toISOString().slice(0, 10)}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success("Exported telemetry traces as JSON");
    } catch (err) {
      toast.error("Failed to export telemetry JSON");
    }
  };

  const summary: TelemetrySummary = useMemo(() => {
    if (!traces || traces.length === 0) {
      return {
        totalCalls: 0,
        totalTokens: 0,
        totalCostUsd: 0,
        avgLatencyMs: 0,
        successRate: 100,
      };
    }
    const totalCalls = traces.length;
    const totalTokens = traces.reduce((acc, t) => acc + (t.totalTokens || 0), 0);
    const totalCostUsd = traces.reduce((acc, t) => acc + (t.costUsd || 0), 0);
    const totalLatency = traces.reduce((acc, t) => acc + (t.latencyMs || 0), 0);
    const successCount = traces.filter((t) => t.status === "success").length;

    return {
      totalCalls,
      totalTokens,
      totalCostUsd: Number(totalCostUsd.toFixed(6)),
      avgLatencyMs: Math.round(totalLatency / totalCalls),
      successRate: Math.round((successCount / totalCalls) * 100),
    };
  }, [traces]);

  return (
    <TelemetryContext.Provider
      value={{
        traces,
        addTrace,
        clearTraces,
        isDrawerOpen,
        setDrawerOpen,
        selectedTrace,
        setSelectedTrace,
        summary,
        exportTracesJson,
        isMounted,
      }}
    >
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetry() {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error("useTelemetry must be used within a TelemetryProvider");
  }
  return context;
}
