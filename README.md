# Sutra — Multimodal AI SaaS & Document Intelligence Platform

[![Framework](https://img.shields.io/badge/Next.js-15.2-black?logo=next.js)](https://nextjs.org/)
[![Database](https://img.shields.io/badge/Neon-PostgreSQL-00E599?logo=postgresql)](https://neon.tech/)
[![ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?logo=drizzle)](https://orm.drizzle.team/)
[![Auth](https://img.shields.io/badge/Clerk-Authentication-6C47FF?logo=clerk)](https://clerk.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript)](https://www.typescriptlang.org/)

Enterprise Multimodal AI Creation SaaS Platform featuring Claude Artifacts-Style Split Content Studio, Interactive Inpainting Canvas Studio, Community Creation Hub with Prompt Remixing, Multi-Tenant Credit System, and Flagship Hybrid Document RAG Engine (`pgvector` + BM25).

---

## 🏗️ Architecture Overview

**Sutra** is engineered as a unified **Next.js 15 App Router** SaaS application with **React Server Components (RSC)**, **Server Actions**, and **Drizzle ORM** directly querying **Neon Serverless PostgreSQL (`pgvector`)**:

```
Sutra/
├── src/
│   ├── app/                          # App Router (Pages, Layouts & API routes)
│   │   ├── (auth)/                   # Authentication pages (Clerk Sign-In / Sign-Up)
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   │   └── sign-up/[[...sign-up]]/page.tsx
│   │   ├── (dashboard)/              # Protected application workspace
│   │   │   ├── layout.tsx            # Dashboard shell
│   │   │   └── dashboard/page.tsx    # User creations & statistics (Drizzle RSC)
│   │   ├── studio/                   # AI Creation Studios
│   │   │   ├── article/page.tsx      # Split-pane Article generation studio
│   │   │   ├── image/page.tsx        # Canvas inpainting studio starter
│   │   │   └── rag/page.tsx          # Flagship Document RAG starter
│   │   ├── community/page.tsx        # Community creations feed & remix hub
│   │   ├── api/                      # Backend Route Handlers
│   │   │   ├── ai/
│   │   │   │   ├── article/route.ts  # Gemini AI article generator
│   │   │   │   └── blog-title/route.ts # Catchy blog title generator
│   │   │   └── user/
│   │   │       └── creations/route.ts # Creation deletion & querying
│   │   ├── layout.tsx                # Root layout (ClerkProvider, Dark Theme, Sonner)
│   │   ├── page.tsx                  # High-converting Hero Landing Page
│   │   └── globals.css               # Dark glassmorphism & Tailwind design system
│   ├── components/                   # UI Components
│   │   ├── layout/                   # Navbar, Footer, CreditBadge
│   │   └── ui/                       # Atom UI components
│   ├── db/                           # Drizzle ORM Database Layer
│   │   ├── index.ts                  # Neon Postgres serverless HTTP connection
│   │   └── schema.ts                 # Type-safe schemas (users, creations, documents, pgvector)
│   ├── lib/                          # Backend utilities & SDKs
│   │   ├── env.ts                    # Zod-validated environment variables
│   │   ├── ai.ts                     # Google Gemini SDK instance
│   │   ├── auth.ts                   # Lazy user sync & atomic credit deduction
│   │   └── cloudinary.ts             # Cloudinary upload helpers
│   ├── types/                        # Global TypeScript interfaces
│   └── middleware.ts                 # Clerk route protection & auth middleware
├── public/                           # Static assets (images, logos, icons, favicon)
├── drizzle.config.ts                 # Drizzle Kit migration configuration
├── next.config.ts                    # Next.js 15 configuration
├── tailwind.config.ts / CSS          # Tailwind CSS styling
├── tsconfig.json                     # Strict TypeScript configuration
└── package.json                      # Unified root dependencies
```

---

## ⚙️ Environment Variables

Create a `.env.local` file in the project root:

```env
# Neon PostgreSQL Connection
DATABASE_URL="postgresql://..."

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# Google Gemini AI
GEMINI_MODEL="gemini-2.5-flash"
GEMINI_API_KEY="AIzaSy..."

# Image & Cloudinary Services
CLIP_DROP_API_KEY="..."
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Push Database Schema to Neon
```bash
npm run db:push
```

### 3. Run Local Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access Sutra.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🚢 Deploying to Vercel

1. Push your repository to GitHub.
2. In Vercel, import the repository with **Root Directory set to `./`**.
3. Add your Environment Variables in Vercel Project Settings.
4. Deploy! Next.js automatically packages all UI pages and serverless API functions into a single unified deployment with 0 CORS configuration needed.
