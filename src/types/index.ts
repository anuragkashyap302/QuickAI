/**
 * Sutra Global TypeScript Types & Interfaces
 * 
 * Ye file hamare pure project ke data structures define karti hai.
 * Interview Tip: TypeScript interfaces use karne se runtime errors avoid hote hain
 * aur pure codebase me 100% autocomplete aur type-safety milti hai.
 */

// User ke plans
export type UserPlan = "free" | "pro" | "premium";

// Creation types - Sutra me user alag-alag tools use karta hai
export type CreationType = 
  | "article" 
  | "blog-title" 
  | "image" 
  | "background-removal" 
  | "object-removal" 
  | "resume-review"
  | "document-qa";

// User Interface
export interface User {
  id: string; // Clerk User ID (e.g. user_2n...)
  email: string;
  name?: string | null;
  imageUrl?: string | null;
  plan: UserPlan;
  credits: number;
  createdAt: Date;
  updatedAt: Date;
}

// User Creation Interface (Articles, Images, etc.)
export interface Creation {
  id: string;
  userId: string;
  type: CreationType;
  title: string;
  prompt: string;
  content: string; // Article markdown ya image secure URL
  imageUrl?: string | null;
  publish: boolean;
  likes: string[]; // User IDs jinhone like kiya hai
  likesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// RAG Document Interface (Phase 6 ke liye ready)
export interface Document {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  status: "processing" | "ready" | "failed";
  createdAt: Date;
}

// RAG Document Chunk Interface (Vector Embeddings ke saath)
export interface DocumentChunk {
  id: string;
  documentId: string;
  chunkIndex: number;
  pageNumber: number;
  content: string;
  embedding?: number[]; // 768-dim Gemini embeddings for pgvector
  createdAt: Date;
}

// Standard API Response Structure (Har API is format me response degi)
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
