"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Scissors,
  Upload,
  Download,
  Loader2,
  Sparkles,
  Brush,
  RotateCcw,
  Trash2,
  Eye,
  EyeOff,
  Wand2,
  Layers,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface StrokePoint {
  x: number;
  y: number;
}

interface Stroke {
  points: StrokePoint[];
  size: number;
}

const SAMPLE_IMAGES = [
  {
    name: "Urban Portrait (Remove Background Person)",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    defaultObject: "person in background",
    replaceSuggestion: "green tree foliage",
  },
  {
    name: "Workspace Desk (Replace Coffee Mug)",
    url: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80",
    defaultObject: "coffee mug",
    replaceSuggestion: "vintage brass compass",
  },
];

export default function RemoveObjectPage() {
  const [mode, setMode] = useState<"remove" | "replace">("remove");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [objectName, setObjectName] = useState("");
  const [replacementPrompt, setReplacementPrompt] = useState("");

  // Canvas Drawing State
  const [brushSize, setBrushSize] = useState<number>(24);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<StrokePoint[]>([]);
  const [showMask, setShowMask] = useState<boolean>(true);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  // Result State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<"result" | "compare">("result");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redraw canvas whenever strokes, brushSize, or imageSrc change
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background image
    if (imageObjRef.current) {
      ctx.drawImage(imageObjRef.current, 0, 0, canvas.width, canvas.height);
    }

    // Draw strokes
    if (showMask) {
      const allStrokes = [...strokes, ...(currentStroke.length > 0 ? [{ points: currentStroke, size: brushSize }] : [])];

      for (const stroke of allStrokes) {
        if (stroke.points.length === 0) continue;

        ctx.strokeStyle = "rgba(244, 63, 94, 0.65)"; // Semi-transparent rose mask
        ctx.fillStyle = "rgba(244, 63, 94, 0.65)";
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = stroke.size;

        ctx.beginPath();
        if (stroke.points.length === 1) {
          ctx.arc(stroke.points[0].x, stroke.points[0].y, stroke.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
          for (let i = 1; i < stroke.points.length; i++) {
            ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
          }
          ctx.stroke();
        }
      }
    }
  }, [strokes, currentStroke, brushSize, showMask]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Load Image onto Canvas
  const loadImageToCanvas = (src: string) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageObjRef.current = img;
      const canvas = canvasRef.current;
      if (canvas) {
        const maxWidth = 550;
        const scale = Math.min(1, maxWidth / img.naturalWidth);
        canvas.width = img.naturalWidth * scale;
        canvas.height = img.naturalHeight * scale;
        setStrokes([]);
        setCurrentStroke([]);
        redrawCanvas();
      }
    };
    img.src = src;
    setImageSrc(src);
    setResultImage(null);
    setOriginalUrl(src);
  };

  // Handle local file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      loadImageToCanvas(url);
    }
  };

  // Load sample image
  const handleLoadSample = async (sample: typeof SAMPLE_IMAGES[0]) => {
    const toastId = toast.loading(`Loading ${sample.name}...`);
    try {
      const response = await fetch(sample.url);
      const blob = await response.blob();
      const file = new File([blob], "sample_inpainting.jpg", { type: "image/jpeg" });
      setSelectedFile(file);
      setObjectName(sample.defaultObject);
      if (sample.replaceSuggestion) {
        setReplacementPrompt(sample.replaceSuggestion);
      }
      loadImageToCanvas(sample.url);
      toast.success("Sample image loaded onto canvas!", { id: toastId });
    } catch {
      toast.error("Failed to load sample image", { id: toastId });
    }
  };

  // Canvas Mouse Coordinates Helper
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // Drawing Events
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!imageSrc) return;
    const coords = getCanvasCoords(e);
    if (!coords) return;

    setIsDrawing(true);
    setCurrentStroke([coords]);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    if (!coords) return;

    setCursorPos({ x: coords.x, y: coords.y });

    if (!isDrawing) return;
    setCurrentStroke((prev) => [...prev, coords]);
  };

  const stopDrawing = () => {
    if (isDrawing && currentStroke.length > 0) {
      setStrokes((prev) => [...prev, { points: currentStroke, size: brushSize }]);
      setCurrentStroke([]);
    }
    setIsDrawing(false);
  };

  // Undo last brush stroke
  const handleUndo = () => {
    setStrokes((prev) => prev.slice(0, -1));
    toast.info("Undid last brush stroke");
  };

  // Clear all mask strokes
  const handleClearMask = () => {
    setStrokes([]);
    setCurrentStroke([]);
    toast.info("Mask cleared");
  };

  // Submit Inpainting Request
  const handleInpaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please upload or choose a sample image first");
      return;
    }
    if (!objectName.trim()) {
      toast.error("Please describe the object painted under the mask");
      return;
    }
    if (mode === "replace" && !replacementPrompt.trim()) {
      toast.error("Please specify what to replace the object with");
      return;
    }

    setIsProcessing(true);
    setResultImage(null);
    const toastId = toast.loading(
      mode === "replace"
        ? `Generatively replacing "${objectName}" with "${replacementPrompt}"...`
        : `Erasing "${objectName}" and reconstructing background...`
    );

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("object", objectName.trim());
      formData.append("mode", mode);
      if (mode === "replace") {
        formData.append("replacementPrompt", replacementPrompt.trim());
      }

      const res = await fetch("/api/ai/remove-object", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Inpainting failed");
      }

      setResultImage(json.data.imageUrl);
      if (json.data.originalUrl) {
        setOriginalUrl(json.data.originalUrl);
      }
      toast.success("Inpainting complete! (2 Credits)", { id: toastId });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Processing failed";
      toast.error(msg, { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50/70 via-white to-fuchsia-50/50 p-4 sm:p-6 lg:p-8 relative overflow-hidden">

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-purple-100">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 text-purple-700 border border-purple-200 text-xs font-bold mb-2 shadow-xs">
              <Brush className="w-3.5 h-3.5 text-purple-600" />
              Interactive Canvas Inpainting Studio
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-violet-700 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Canvas Inpainting & Generative Fill
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              Paint directly over unwanted objects to erase them or inpaint photorealistic generative replacements.
            </p>
          </div>

          {/* 1-Click Sample Image Loaders */}
          <div className="flex flex-wrap items-center gap-2.5">
            {SAMPLE_IMAGES.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleLoadSample(sample)}
                className="px-4 py-2 rounded-full bg-white hover:bg-purple-50 text-purple-800 text-xs font-bold border-2 border-purple-100 shadow-sm hover:shadow-md hover:scale-105 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                Sample #{idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Main Dual-Pane Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start min-h-[640px]">
          {/* LEFT PANE: Brush Canvas & Inpainting Form (6 Cols) */}
          <div className="lg:col-span-6 bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-purple-100 shadow-xl space-y-4 flex flex-col">
            {/* Mode Switcher */}
            <div className="flex items-center justify-between pb-3.5 border-b border-purple-100">
              <div className="flex items-center gap-1 bg-purple-50/60 p-1 rounded-full border border-purple-100">
                <button
                  type="button"
                  onClick={() => setMode("remove")}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    mode === "remove"
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                      : "text-slate-600 hover:text-purple-700 hover:bg-white"
                  }`}
                >
                  <Scissors className="w-3.5 h-3.5" />
                  Object Eraser
                </button>
                <button
                  type="button"
                  onClick={() => setMode("replace")}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    mode === "replace"
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                      : "text-slate-600 hover:text-purple-700 hover:bg-white"
                  }`}
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  Generative Replace
                </button>
              </div>
              <span className="px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-[11px] text-purple-700 font-mono font-bold">
                ⚡ 2 Credits
              </span>
            </div>

            {/* Interactive Brush Toolbar (When image is loaded) */}
            {imageSrc && (
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs text-purple-900 font-bold flex items-center gap-1">
                    <Brush className="w-3.5 h-3.5 text-purple-600" />
                    Brush: {brushSize}px
                  </span>
                  <input
                    type="range"
                    min={8}
                    max={60}
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-24 accent-purple-600 cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={strokes.length === 0}
                    className="p-2 rounded-full bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-900 text-xs border border-purple-100 disabled:opacity-40 transition-all shadow-xs cursor-pointer"
                    title="Undo Last Stroke"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleClearMask}
                    disabled={strokes.length === 0}
                    className="p-2 rounded-full bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-900 text-xs border border-purple-100 disabled:opacity-40 transition-all shadow-xs cursor-pointer"
                    title="Clear Mask"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMask(!showMask)}
                    className="p-2 rounded-full bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-900 text-xs border border-purple-100 transition-all shadow-xs cursor-pointer"
                    title={showMask ? "Hide Mask" : "Show Mask"}
                  >
                    {showMask ? <Eye className="w-3.5 h-3.5 text-purple-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                  </button>
                </div>
              </div>
            )}

            {/* Canvas Painting Viewport / Upload Dropzone */}
            <div className="relative w-full rounded-2xl overflow-hidden border-2 border-dashed border-purple-200 bg-purple-50/30 min-h-[320px] flex items-center justify-center">
              {imageSrc ? (
                <div className="relative cursor-crosshair max-w-full overflow-hidden flex items-center justify-center p-2">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={() => {
                      stopDrawing();
                      setCursorPos(null);
                    }}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="max-w-full rounded-xl shadow-lg border-2 border-purple-100 touch-none bg-white"
                  />
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:bg-purple-50/60 transition-colors w-full h-full"
                >
                  <div className="w-14 h-14 rounded-full bg-purple-100 border-2 border-purple-200 flex items-center justify-center text-purple-600 mb-3 shadow-sm">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">Click or drag image to open Canvas</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">PNG, JPG or WebP up to 10MB</p>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Form Directives */}
            <form onSubmit={handleInpaintSubmit} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Describe Painted Object to {mode === "remove" ? "Erase" : "Replace"}{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. coffee mug, person in red jacket, microphone"
                  value={objectName}
                  onChange={(e) => setObjectName(e.target.value)}
                  className="w-full px-4 py-3 rounded-full bg-white border-2 border-purple-100 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all font-medium shadow-xs"
                />
              </div>

              {mode === "replace" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Generative Replacement Prompt <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. luxury gold Rolex watch, vintage Polaroid camera, red sports car"
                    value={replacementPrompt}
                    onChange={(e) => setReplacementPrompt(e.target.value)}
                    className="w-full px-4 py-3 rounded-full bg-white border-2 border-purple-100 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all font-medium shadow-xs"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing || !imageSrc || !objectName.trim()}
                className="w-full py-4 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-600/25 hover:shadow-xl hover:scale-[1.01] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Synthesizing Inpainting...
                  </>
                ) : mode === "replace" ? (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Generative Replace Object (2 Credits)
                  </>
                ) : (
                  <>
                    <Scissors className="w-4 h-4" />
                    Erase Masked Object (2 Credits)
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT PANE: Inpainted Results & Comparison Canvas (6 Cols) */}
          <div className="lg:col-span-6 bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-purple-100 shadow-xl flex flex-col h-[640px]">
            <div className="flex items-center justify-between pb-3.5 border-b border-purple-100">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-purple-600" />
                <h2 className="text-sm font-bold text-slate-900">Inpainted Output & Comparison</h2>
              </div>

              {resultImage && (
                <div className="flex items-center gap-1 bg-purple-50/60 p-1 rounded-full border border-purple-100">
                  <button
                    onClick={() => setViewTab("result")}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      viewTab === "result"
                        ? "bg-purple-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-purple-700"
                    }`}
                  >
                    Result
                  </button>
                  <button
                    onClick={() => setViewTab("compare")}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      viewTab === "compare"
                        ? "bg-purple-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-purple-700"
                    }`}
                  >
                    Before / After
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto py-4 flex flex-col items-center justify-center">
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <Loader2 className="w-10 h-10 animate-spin text-purple-600 mb-3" />
                  <p className="text-sm font-bold text-slate-900">Synthesizing Diffusion Inpaint...</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs font-medium">
                    Reconstructing background texture and seamlessly blending lighting...
                  </p>
                </div>
              ) : resultImage ? (
                <div className="w-full space-y-4 flex flex-col items-center">
                  {viewTab === "result" ? (
                    <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden border border-purple-100 shadow-md bg-purple-50/20">
                      <Image
                        src={resultImage}
                        alt="Inpainted Result"
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                      <div className="space-y-1 text-center">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Before</span>
                        <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
                          {originalUrl && (
                            <Image
                              src={originalUrl}
                              alt="Original"
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                      </div>
                      <div className="space-y-1 text-center">
                        <span className="text-[10px] uppercase font-bold text-purple-600">After Inpaint</span>
                        <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-purple-500 shadow-xs">
                          <Image
                            src={resultImage}
                            alt="After Inpaint"
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <a
                    href={resultImage}
                    target="_blank"
                    rel="noreferrer"
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-purple-600/20 hover:scale-105"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download High-Res Inpaint
                  </a>
                </div>
              ) : (
                <div className="text-center p-8 text-slate-400 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center text-purple-400 mb-3 border-2 border-purple-100 shadow-xs">
                    <Scissors className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">Clean Inpainted Result</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed font-medium">
                    Upload an image on the left, draw an overlay mask over any object, and click{" "}
                    <strong className="text-purple-700">Synthesize Inpaint</strong>.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

