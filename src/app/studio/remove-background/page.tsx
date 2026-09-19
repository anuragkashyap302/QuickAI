"use client";

import { useState } from "react";
import { Eraser, Upload, Download, Loader2, Image as ImageIcon, Sparkles } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function RemoveBackgroundPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResultImage(null);
    }
  };

  const handleRemoveBg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please upload an image first");
      return;
    }

    setIsProcessing(true);
    setResultImage(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const res = await fetch("/api/ai/remove-background", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to remove background");

      setResultImage(json.data.imageUrl);
      toast.success("Background removed seamlessly!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center gap-3 pb-6 border-b border-border/40">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#F76C1C] to-[#F04A3C] flex items-center justify-center shadow-lg shadow-orange-500/20 text-white">
          <Eraser className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">AI Background Removal</h1>
          <p className="text-sm text-muted-foreground">
            Instantly erase image backgrounds with pixel-perfect precision using Cloudinary AI.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          <form onSubmit={handleRemoveBg} className="glass-panel rounded-2xl p-6 border border-border/60 space-y-4">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Upload Image <span className="text-orange-400">*</span>
            </label>

            <div className="border-2 border-dashed border-border/80 hover:border-orange-500/60 rounded-2xl p-6 text-center transition-colors cursor-pointer relative bg-secondary/30">
              <input
                type="file"
                accept="image/*"
                required
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {previewUrl ? (
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32 rounded-xl overflow-hidden mb-2">
                    <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                  </div>
                  <p className="text-xs text-slate-300 font-medium">{selectedFile?.name}</p>
                  <span className="text-[11px] text-orange-400 mt-1">Click to replace</span>
                </div>
              ) : (
                <div className="flex flex-col items-center py-6">
                  <Upload className="w-8 h-8 text-orange-400 mb-2" />
                  <p className="text-sm font-semibold text-white">Click or drag image here</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP up to 10MB</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isProcessing || !selectedFile}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#F76C1C] to-[#F04A3C] hover:opacity-95 disabled:opacity-50 text-white text-sm font-semibold shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Isolating Background...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Remove Background (2 Credits)
                </>
              )}
            </button>
          </form>
        </div>

        <div className="lg:col-span-7">
          <div className="glass-panel rounded-2xl p-6 border border-border/60 min-h-[400px] flex flex-col justify-center items-center">
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="w-10 h-10 animate-spin text-orange-400 mb-3" />
                <p className="text-sm font-medium text-slate-200">Segmenting subject & removing background...</p>
              </div>
            ) : resultImage ? (
              <div className="space-y-4 w-full flex flex-col items-center">
                <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden border border-border bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px] shadow-2xl">
                  <Image src={resultImage} alt="Transparent Output" fill className="object-contain p-4" />
                </div>
                <a
                  href={resultImage}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Transparent PNG
                </a>
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground flex flex-col items-center">
                <Eraser className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <h3 className="text-sm font-semibold text-white">Transparent output will render here</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Upload an image on the left and click remove background.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
