"use client";

import { useState } from "react";
import { Image as ImageIcon, Sparkles, Download, Loader2, Wand2, Eye } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function ImageGenerationPage() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Realistic");
  const [publish, setPublish] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const styles = [
    { name: "Realistic", label: "Photorealistic" },
    { name: "Anime", label: "Anime Style" },
    { name: "3D Render", label: "3D Render" },
    { name: "Cyberpunk", label: "Cyberpunk" },
    { name: "Cinematic", label: "Cinematic" },
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error("Please enter an image prompt");
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const res = await fetch("/api/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style, publish }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to generate image");

      setGeneratedImage(json.data.imageUrl);
      toast.success("Image generated & uploaded to Cloudinary!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Image generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#20C363] to-[#11B97E] flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI Image Generation</h1>
            <p className="text-sm text-muted-foreground">
              Generate photorealistic visuals, 3D art, and anime imagery powered by ClipDrop & Cloudinary.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          <form onSubmit={handleGenerate} className="glass-panel rounded-2xl p-6 border border-border/60 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Prompt Description <span className="text-emerald-400">*</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="e.g. A serene Japanese garden with cherry blossoms, soft sunset light, reflections on pond..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-secondary/60 border border-border text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Art Style Preset
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {styles.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => setStyle(s.name)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      style === s.name
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm"
                        : "bg-secondary/60 border-border text-muted-foreground hover:text-white"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="publish"
                checked={publish}
                onChange={(e) => setPublish(e.target.checked)}
                className="w-4 h-4 rounded border-border text-emerald-500 focus:ring-emerald-400 cursor-pointer"
              />
              <label htmlFor="publish" className="text-xs text-slate-300 cursor-pointer">
                Publish to Community Creations Hub
              </label>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#20C363] to-[#11B97E] hover:opacity-95 disabled:opacity-50 text-white text-sm font-semibold shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating High-Res Visual...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Image (2 Credits)
                </>
              )}
            </button>
          </form>
        </div>

        <div className="lg:col-span-7">
          <div className="glass-panel rounded-2xl p-6 border border-border/60 min-h-[450px] flex flex-col justify-center items-center">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-400 mb-3" />
                <p className="text-sm font-medium text-slate-200">Rendering visual with ClipDrop Diffusion...</p>
                <p className="text-xs text-muted-foreground mt-1">Uploading to Cloudinary CDN</p>
              </div>
            ) : generatedImage ? (
              <div className="space-y-4 w-full flex flex-col items-center">
                <div className="relative w-full max-w-lg aspect-square rounded-2xl overflow-hidden border border-border shadow-2xl">
                  <Image
                    src={generatedImage}
                    alt="AI Generated"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={generatedImage}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download High-Res
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground flex flex-col items-center">
                <ImageIcon className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <h3 className="text-sm font-semibold text-white">Your generated artwork will render here</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Choose a style, write your prompt, and click generate.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
