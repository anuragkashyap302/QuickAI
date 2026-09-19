"use client";

import { useState } from "react";
import { FileText, Upload, Download, Loader2, Sparkles, CheckCircle, AlertTriangle, Award } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

export default function ReviewResumePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [reviewResult, setReviewResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
        toast.error("Please upload a valid PDF document");
        return;
      }
      setSelectedFile(file);
      setReviewResult(null);
    }
  };

  const handleReviewResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please upload your PDF resume first");
      return;
    }

    setIsProcessing(true);
    setReviewResult(null);

    try {
      const formData = new FormData();
      formData.append("resume", selectedFile);

      const res = await fetch("/api/ai/review-resume", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to review resume");

      setReviewResult(json.data.content);
      toast.success("Resume analyzed with recruiter insights!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center gap-3 pb-6 border-b border-border/40">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#12B7AC] to-[#08B6CE] flex items-center justify-center shadow-lg shadow-teal-500/20 text-white">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">AI Resume Reviewer & ATS Optimizer</h1>
          <p className="text-sm text-muted-foreground">
            Get actionable feedback from a Silicon Valley recruiter AI: ATS score, strengths, and bullet-point fixes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          <form onSubmit={handleReviewResume} className="glass-panel rounded-2xl p-6 border border-border/60 space-y-4">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Upload Resume (PDF only) <span className="text-teal-400">*</span>
            </label>

            <div className="border-2 border-dashed border-border/80 hover:border-teal-500/60 rounded-2xl p-6 text-center transition-colors cursor-pointer relative bg-secondary/30">
              <input
                type="file"
                accept="application/pdf"
                required
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {selectedFile ? (
                <div className="flex flex-col items-center py-4">
                  <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-2">
                    <FileText className="w-7 h-7" />
                  </div>
                  <p className="text-sm text-white font-medium line-clamp-1">{selectedFile.name}</p>
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <span className="text-[11px] text-teal-400 mt-2">Click to choose another PDF</span>
                </div>
              ) : (
                <div className="flex flex-col items-center py-8">
                  <Upload className="w-8 h-8 text-teal-400 mb-2" />
                  <p className="text-sm font-semibold text-white">Click or drag PDF resume here</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF up to 5MB</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isProcessing || !selectedFile}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#12B7AC] to-[#08B6CE] hover:opacity-95 disabled:opacity-50 text-white text-sm font-semibold shadow-lg shadow-teal-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing Resume with ATS Engine...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Review Resume (2 Credits)
                </>
              )}
            </button>
          </form>
        </div>

        <div className="lg:col-span-7">
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-border/60 min-h-[450px] flex flex-col justify-center">
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="w-10 h-10 animate-spin text-teal-400 mb-3" />
                <p className="text-sm font-medium text-slate-200">Evaluating ATS score & recruiter checklist...</p>
              </div>
            ) : reviewResult ? (
              <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-slate-300 prose-li:text-slate-300 prose-strong:text-teal-300">
                <ReactMarkdown>{reviewResult}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground flex flex-col items-center">
                <Award className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <h3 className="text-sm font-semibold text-white">Comprehensive feedback will appear here</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Upload your PDF resume on the left to get ATS scores and line-by-line improvements.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
