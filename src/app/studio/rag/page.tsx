import { FileText, Sparkles, Search, Layers, Cpu, CheckCircle2 } from "lucide-react";
import Link from "next/link";

/**
 * Flagship Document Intelligence & Hybrid RAG Studio (Phase 6 Workspace Starter)
 */
export default function DocumentRagPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-border/40">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30 text-xs font-semibold mb-2">
            <FileText className="w-3.5 h-3.5" />
            Phase 6 Flagship Feature
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Document Intelligence & Hybrid RAG Engine
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Hybrid Dense Vector (pgvector) + Sparse BM25 Search with interactive yellow citation bounding-box highlights.
          </p>
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-8 border border-rose-500/20 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Layout Semantic Chunking</h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Extracts text, headers, and tables while preserving page coordinates and document hierarchy.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Reciprocal Rank Fusion (RRF)</h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Fuses cosine similarity from pgvector with full-text BM25 search for 100% precision on exact keywords.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center mb-4">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Interactive PDF Citations</h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Clicking citations auto-scrolls to the exact page and draws highlighted yellow bounding boxes over sources.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Database schemas & pgvector extensions are configured in Phase 1
          </div>
          <Link
            href="/dashboard"
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-all"
          >
            Ready for Phase 6
          </Link>
        </div>
      </div>
    </div>
  );
}
