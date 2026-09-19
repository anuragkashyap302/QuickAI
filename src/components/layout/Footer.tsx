import Link from "next/link";
import { Sparkles, Github, Twitter, Heart } from "lucide-react";

/**
 * QuickAI Global Footer
 */
export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Sutra Enterprise. Multimodal AI SaaS & Document Intelligence Platform.
          </span>
        </div>

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/community" className="hover:text-white transition-colors">
            Community Hub
          </Link>
          <Link href="/dashboard" className="hover:text-white transition-colors">
            Dashboard
          </Link>
          <a
            href="https://github.com/anuragkashyap302/QuickAI"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Github className="w-4 h-4" />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
