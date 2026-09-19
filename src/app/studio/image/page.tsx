import { Image as ImageIcon, Sparkles, Paintbrush, Wand2, ArrowRight } from "lucide-react";
import Link from "next/link";

/**
 * Image & Inpainting Studio (Phase 3 Workspace Starter)
 */
export default function ImageStudioPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-border/40">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-semibold mb-2">
            <ImageIcon className="w-3.5 h-3.5" />
            Phase 3 Image Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Canvas Inpainting & Image Generation
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Generate photorealistic visuals, remove backgrounds, or paint masks to replace objects generatively.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel rounded-2xl p-8 border border-purple-500/20 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
              <Wand2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Text-to-Image Generation</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Create high-resolution imagery using multi-style presets (Photorealistic, Anime, 3D Render, Cyberpunk) with automatic prompt enhancement.
            </p>
          </div>
          <div className="mt-8 pt-4 border-t border-border/40 flex items-center justify-between">
            <span className="text-xs font-medium text-purple-400">Integrated with ClipDrop & Cloudinary</span>
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors"
            >
              Ready in Phase 3
            </Link>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-8 border border-pink-500/20 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-pink-600/20 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-4">
              <Paintbrush className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Interactive Brush Canvas Inpainting</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Upload any image and brush directly over unwanted items for generative erasure or prompt-driven replacement (*"Replace jacket with tuxedo"*).
            </p>
          </div>
          <div className="mt-8 pt-4 border-t border-border/40 flex items-center justify-between">
            <span className="text-xs font-medium text-pink-400">HTML5 / Fabric.js Canvas Masking</span>
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 transition-colors"
            >
              Ready in Phase 3
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
