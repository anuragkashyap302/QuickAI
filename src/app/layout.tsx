import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { TelemetryProvider } from "@/context/TelemetryContext";
import { TelemetryDrawer } from "@/components/telemetry/TelemetryDrawer";
import { TelemetryFloatingButton } from "@/components/telemetry/TelemetryFloatingButton";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sutra — Multimodal AI SaaS & Document Intelligence Platform",
  description:
    "Enterprise AI SaaS platform featuring Claude Artifacts-style split content studio, interactive canvas brush inpainting, hybrid PDF document RAG with bounding-box citations, and community prompt remixing.",
  keywords: ["Sutra", "AI SaaS", "Document RAG", "Inpainting Canvas", "Next.js 15", "Gemini AI", "Drizzle ORM", "pgvector"],
};

/**
 * Root Layout (Server Component)
 * 
 * Ye component puri application ko wrap karta hai:
 * 1. ClerkProvider: Authentication context provide karta hai with dark theme
 * 2. TelemetryProvider: Real-time LLM observability, TTFT latency & token accounting
 * 3. getOrCreateCurrentUser: Agar user login hai, toh Neon DB se credits fetch karta hai
 * 4. Navbar & Footer: Global navigation structure
 * 5. Toaster: Beautiful toast alerts
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch current user from database (Server Component direct DB query)
  let userCredits = 20;
  try {
    const user = await getOrCreateCurrentUser();
    if (user) {
      userCredits = user.credits;
    }
  } catch {
    // Unauthenticated or first load fallback
    userCredits = 20;
  }

  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#6366f1",
          colorBackground: "#0d0f17",
          colorInputBackground: "#171a26",
          colorInputText: "#f3f4f6",
        },
      }}
    >
      <html lang="en" className="dark scroll-smooth">
        <body className="min-h-screen flex flex-col bg-[#090a0f] text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
          <TelemetryProvider>
            <Navbar credits={userCredits} />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
            <TelemetryDrawer />
            <TelemetryFloatingButton />
            <Toaster richColors position="top-right" theme="dark" />
          </TelemetryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

