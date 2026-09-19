import { pgTable, text, timestamp, integer, boolean, serial, uuid, customType } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * Custom pgvector data type for 768-dimensional Gemini embeddings
 * 
 * Ye type Phase 6 (Hybrid RAG) me semantic vector search ke liye use hoga.
 * Neon Postgres me `pgvector` extension ke through sub-50ms cosine similarity queries chalti hain.
 */
const vector = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return "vector(768)";
  },
  toDriver(value: number[]): string {
    return `[${value.join(",")}]`;
  },
  fromDriver(value: string): number[] {
    return JSON.parse(value.replace(/^{/, "[").replace(/}$/, "]"));
  },
});

/**
 * 1. USERS TABLE
 * 
 * Clerk user authentication sync karne aur credits track karne ke liye.
 * Har user ko daily 20 free credits milte hain.
 */
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk User ID (e.g. user_2n8x...)
  email: text("email").notNull(),
  name: text("name"),
  imageUrl: text("image_url"),
  plan: text("plan").default("free").notNull(), // 'free' | 'pro' | 'premium'
  credits: integer("credits").default(20).notNull(), // Available creation credits
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * 2. CREATIONS TABLE (Existing Production Table Compatibility)
 * 
 * Existing Neon table me serial PK aur timestamptz use ho raha hai.
 * Zero-data loss migration ke liye hum existing schema se match kar rahe hain.
 */
export const creations = pgTable("creations", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(), // 'article' | 'blog-title' | 'image' | 'resume-review' | 'document-qa'
  title: text("title").default("Untitled Creation"),
  prompt: text("prompt").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  publish: boolean("publish").default(false),
  likes: text("likes").array().default(sql`'{}'::text[]`),
  likesCount: integer("likes_count").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * 3. DOCUMENTS TABLE (For Phase 6 RAG)
 * 
 * User dwara upload ki gayi PDF documents ka metadata store hota hai.
 */
export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size").notNull(),
  status: text("status").default("processing").notNull(), // 'processing' | 'ready' | 'failed'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * 4. DOCUMENT CHUNKS TABLE (For Hybrid Vector + BM25 Search)
 * 
 * Har PDF ke parsed text chunks, page numbers aur pgvector embeddings.
 */
export const documentChunks = pgTable("document_chunks", {
  id: uuid("id").defaultRandom().primaryKey(),
  documentId: uuid("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
  chunkIndex: integer("chunk_index").notNull(),
  pageNumber: integer("page_number").notNull(),
  content: text("content").notNull(), // Chunked text content
  embedding: vector("embedding"), // 768-dim Gemini vector embedding
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Type inference from schemas
export type SelectUser = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type SelectCreation = typeof creations.$inferSelect;
export type InsertCreation = typeof creations.$inferInsert;
export type SelectDocument = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;
export type SelectDocumentChunk = typeof documentChunks.$inferSelect;
export type InsertDocumentChunk = typeof documentChunks.$inferInsert;
