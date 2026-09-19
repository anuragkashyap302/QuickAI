import Link from "next/link";
import Image from "next/image";
import { 
  SquarePen, 
  Hash, 
  Image as ImageIcon, 
  Eraser, 
  Scissors, 
  FileText, 
  Check, 
  Star, 
  ArrowRight,
  Play
} from "lucide-react";

export default function HomePage() {
  const tools = [
    {
      title: "AI Article Writer",
      description: "Generate high-quality, engaging articles on any topic with our AI writing technology.",
      icon: SquarePen,
      gradient: "from-[#3588F2] to-[#0BB0D7]",
      shadow: "shadow-blue-500/20",
      href: "/studio/article",
    },
    {
      title: "Blog Title Generator",
      description: "Find the perfect, catchy title for your blog posts with our AI-powered generator.",
      icon: Hash,
      gradient: "from-[#B153EA] to-[#E549A3]",
      shadow: "shadow-purple-500/20",
      href: "/studio/blog-titles",
    },
    {
      title: "AI Image Generation",
      description: "Create stunning visuals with our AI image generation tool, experience the power of generative diffusion.",
      icon: ImageIcon,
      gradient: "from-[#20C363] to-[#11B97E]",
      shadow: "shadow-emerald-500/20",
      href: "/studio/image",
    },
    {
      title: "Background Removal",
      description: "Effortlessly remove backgrounds from your images with our AI-driven segmentation tool.",
      icon: Eraser,
      gradient: "from-[#F76C1C] to-[#F04A3C]",
      shadow: "shadow-orange-500/20",
      href: "/studio/remove-background",
    },
    {
      title: "Object Removal",
      description: "Remove unwanted objects from your images seamlessly with our AI inpainting synthesis.",
      icon: Scissors,
      gradient: "from-[#5C6AF1] to-[#427DF5]",
      shadow: "shadow-indigo-500/20",
      href: "/studio/remove-object",
    },
    {
      title: "Resume Reviewer",
      description: "Get your resume reviewed by AI with ATS scores and recruiter insights to land your dream job.",
      icon: FileText,
      gradient: "from-[#12B7AC] to-[#08B6CE]",
      shadow: "shadow-teal-500/20",
      href: "/studio/review-resume",
    },
  ];

  const testimonials = [
    {
      name: "John Doe",
      role: "Marketing Director, TechCorp",
      content: "Sutra has revolutionized our content workflow. The quality of articles and images is outstanding, saving us hours every week.",
      rating: 5,
    },
    {
      name: "Jane Smith",
      role: "Content Creator, PixelStudio",
      content: "The AI background removal and inpainting tools are magic. Best creative suite we've used for client presentations.",
      rating: 5,
    },
    {
      name: "David Lee",
      role: "Software Engineer, NextGen",
      content: "The resume reviewer gave me exact bullet-point metrics that helped me land interviews at top tech firms.",
      rating: 5,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-[#090a0f]">
      {/* Background Soft Glow & Gradient Mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none opacity-40 -z-10">
        <Image
          src="/assets/gradientBackground.png"
          alt="Mesh Glow"
          fill
          className="object-cover blur-2xl"
          priority
        />
      </div>

      {/* Hero Section */}
      <section className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col items-center text-center">
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.15]">
          Create amazing content <br className="hidden sm:inline" />
          <span className="gradient-text">with AI tools</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl font-normal leading-relaxed">
          Transform your content creation with our suite of premium AI tools. Write articles, generate images, and enhance your workflow.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/dashboard"
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition-all cursor-pointer"
          >
            Start creating now
          </Link>

          <Link
            href="/community"
            className="px-8 py-3.5 rounded-full glass-panel hover:bg-secondary/70 text-white font-medium text-sm border border-border flex items-center gap-2 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            Explore Creations
          </Link>
        </div>

        {/* Social Proof Bar */}
        <div className="mt-10 inline-flex items-center gap-3 px-4 py-2 rounded-full glass-panel border border-border/80">
          <div className="relative w-20 h-6">
            <Image
              src="/assets/user_group.png"
              alt="Users"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            Trusted by <strong className="text-white">10k+</strong> creators
          </span>
        </div>
      </section>

      {/* 6 AI Tools Grid (Matching Screenshot 2) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-400 mb-2">
            Powerful Multimodal Workspace
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Everything you need to create, enhance, and optimize
          </h2>
          <p className="text-muted-foreground mt-2 text-sm max-w-xl mx-auto">
            Explore 6 high-speed AI tools crafted for modern creators and engineering workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.title}
                href={tool.href}
                className="glass-card rounded-3xl p-7 flex flex-col justify-between group hover:border-indigo-500/40 transition-all duration-300 relative overflow-hidden"
              >
                <div>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${tool.gradient} ${tool.shadow} shadow-lg flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7" />
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {tool.title}
                  </h3>

                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/40 flex items-center text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 gap-1.5">
                  Launch Studio
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Choose Your Plan Section (Matching Screenshot 3) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white">
            Choose Your Plan
          </h2>
          <p className="text-muted-foreground mt-3 text-sm sm:text-base max-w-xl mx-auto">
            Start for free and scale up as you grow. Find the perfect plan for your content creation needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free Plan Card */}
          <div className="glass-panel rounded-3xl p-8 border border-border/80 flex flex-col justify-between relative">
            <div>
              <h3 className="text-xl font-bold text-white">Free</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">$0</span>
                <span className="text-xs text-muted-foreground">/ forever</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Always free for testing</p>

              <div className="mt-8 space-y-3.5">
                {["Title Generation", "Article Generation", "20 Daily Free Credits"].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-xs text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/dashboard"
              className="mt-8 w-full py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-white text-xs font-semibold text-center border border-border transition-all block"
            >
              Get Started Free
            </Link>
          </div>

          {/* Premium Plan Card */}
          <div className="glass-panel rounded-3xl p-8 border border-indigo-500/40 relative flex flex-col justify-between shadow-2xl shadow-indigo-500/10">
            <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
              Most Popular
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">Premium</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">$2</span>
                <span className="text-xs text-muted-foreground">/ month</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Only billed monthly</p>

              <div className="mt-8 space-y-3.5">
                {[
                  "Title Generation",
                  "Article Generation",
                  "Generate Image (ClipDrop)",
                  "Remove Background",
                  "Remove Object (Inpaint)",
                  "Resume Reviewer (PDF)",
                  "Unlimited Priority Credits",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-xs text-slate-200">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/dashboard"
              className="mt-8 w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 text-white text-xs font-semibold text-center shadow-lg shadow-indigo-600/25 transition-all block"
            >
              Upgrade to Premium
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full border-t border-border/40">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Loved by Creators & Builders</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="glass-card rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 mb-3 text-amber-400">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  &ldquo;{t.content}&rdquo;
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/40 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {t.name[0]}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{t.name}</h4>
                  <p className="text-[11px] text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
