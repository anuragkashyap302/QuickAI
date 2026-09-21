// Centralized studio styles and vibrant light theme palettes inspired by dummyStyles.js

export const studioPalettes = {
  // Flagship Hybrid RAG (Rose, Amber, Orange, Warm Gold)
  rag: {
    container: "min-h-screen bg-gradient-to-br from-rose-50/70 via-white to-amber-50/50 p-4 sm:p-6 lg:p-8 relative overflow-hidden",
    badge: "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/20",
    headerTitle: "bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 bg-clip-text text-transparent",
    cardBorder: "border-rose-100",
    buttonPrimary: "bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-lg shadow-rose-600/20",
    buttonSecondary: "bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 shadow-xs",
    pillInput: "p-3 rounded-full border-2 border-rose-100 bg-white placeholder:text-slate-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all",
    activePill: "bg-rose-600 text-white border-rose-600 shadow-md",
  },
  // Claude Artifacts Article Studio (Indigo, Blue, Violet)
  article: {
    container: "min-h-screen bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/60 p-4 sm:p-6 lg:p-8 relative overflow-hidden",
    badge: "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/20",
    headerTitle: "bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 bg-clip-text text-transparent",
    cardBorder: "border-indigo-100",
    buttonPrimary: "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-lg shadow-indigo-600/20",
    buttonSecondary: "bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs",
    pillInput: "p-3 rounded-full border-2 border-indigo-100 bg-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all",
    activePill: "bg-indigo-600 text-white border-indigo-600 shadow-md",
  },
  // Canvas Inpainting Studio (Violet, Purple, Fuchsia)
  inpaint: {
    container: "min-h-screen bg-gradient-to-br from-violet-50/70 via-white to-fuchsia-50/50 p-4 sm:p-6 lg:p-8 relative overflow-hidden",
    badge: "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-600/20",
    headerTitle: "bg-gradient-to-r from-violet-700 via-purple-600 to-pink-600 bg-clip-text text-transparent",
    cardBorder: "border-purple-100",
    buttonPrimary: "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-purple-600/20",
    buttonSecondary: "bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 shadow-xs",
    pillInput: "p-3 rounded-full border-2 border-purple-100 bg-white placeholder:text-slate-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all",
    activePill: "bg-purple-600 text-white border-purple-600 shadow-md",
  },
  // AI Image Generation Studio (Emerald, Cyan, Teal)
  image: {
    container: "min-h-screen bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/60 p-4 sm:p-6 lg:p-8 relative overflow-hidden",
    badge: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20",
    headerTitle: "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent",
    cardBorder: "border-emerald-100",
    buttonPrimary: "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/20",
    buttonSecondary: "bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs",
    pillInput: "p-3 rounded-full border-2 border-emerald-100 bg-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all",
    activePill: "bg-emerald-600 text-white border-emerald-600 shadow-md",
  },
  // Resume ATS Reviewer (Teal, Cyan, Sky)
  resume: {
    container: "min-h-screen bg-gradient-to-br from-teal-50/70 via-white to-cyan-50/60 p-4 sm:p-6 lg:p-8 relative overflow-hidden",
    badge: "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md shadow-teal-600/20",
    headerTitle: "bg-gradient-to-r from-teal-700 via-cyan-600 to-sky-600 bg-clip-text text-transparent",
    cardBorder: "border-teal-100",
    buttonPrimary: "bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white shadow-lg shadow-teal-600/20",
    buttonSecondary: "bg-white hover:bg-teal-50 text-teal-700 border border-teal-200 shadow-xs",
    pillInput: "p-3 rounded-full border-2 border-teal-100 bg-white placeholder:text-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all",
    activePill: "bg-teal-600 text-white border-teal-600 shadow-md",
  },
  // Blog Titles Generator (Pink, Rose, Purple)
  blog: {
    container: "min-h-screen bg-gradient-to-br from-pink-50/70 via-white to-rose-50/60 p-4 sm:p-6 lg:p-8 relative overflow-hidden",
    badge: "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/20",
    headerTitle: "bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 bg-clip-text text-transparent",
    cardBorder: "border-pink-100",
    buttonPrimary: "bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white shadow-lg shadow-pink-600/20",
    buttonSecondary: "bg-white hover:bg-pink-50 text-pink-700 border border-pink-200 shadow-xs",
    pillInput: "p-3 rounded-full border-2 border-pink-100 bg-white placeholder:text-slate-400 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all",
    activePill: "bg-pink-600 text-white border-pink-600 shadow-md",
  },
  // Background Remover (Amber, Orange, Coral)
  bgRemover: {
    container: "min-h-screen bg-gradient-to-br from-amber-50/70 via-white to-orange-50/60 p-4 sm:p-6 lg:p-8 relative overflow-hidden",
    badge: "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20",
    headerTitle: "bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 bg-clip-text text-transparent",
    cardBorder: "border-amber-100",
    buttonPrimary: "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg shadow-orange-600/20",
    buttonSecondary: "bg-white hover:bg-amber-50 text-amber-700 border border-amber-200 shadow-xs",
    pillInput: "p-3 rounded-full border-2 border-amber-100 bg-white placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all",
    activePill: "bg-amber-600 text-white border-amber-600 shadow-md",
  },
};
