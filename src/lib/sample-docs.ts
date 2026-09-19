export const SAMPLE_WHITEPAPER = {
  fileName: "Sutra_Enterprise_AI_Whitepaper_2026.pdf",
  fileSize: 1024 * 64,
  text: `=== Page 1 ===
SUTRA ENTERPRISE MULTIMODAL AI SAAS PLATFORM
Whitepaper Version 2.4 — Confidential Technical Overview

1. Executive Summary
Sutra is a next-generation enterprise AI Creation SaaS engineered on Next.js 15, Neon Serverless PostgreSQL with pgvector, and Google Gemini 2.5. The platform delivers sub-50ms token generation, interactive image inpainting, and layout-aware hybrid document intelligence. Sutra guarantees 99.99% availability SLA and processes over 50,000 document queries per minute across globally distributed edge regions.

2. Full-Stack Modern Architecture
The frontend is constructed using React 19 Server Components and Next.js 15 App Router. Zero CORS latency is achieved through unified serverless route handlers. Authentication and multi-tenant isolation are enforced using Clerk session tokens validated at the edge middleware layer with sub-5ms verification.

=== Page 2 ===
3. Hybrid Retrieval Engine & Reciprocal Rank Fusion (RRF)
Traditional vector-only RAG architectures suffer from semantic blindness when handling exact part numbers, acronyms, and financial line items. Sutra solves this through a dual-channel hybrid retrieval pipeline:

Channel A (Dense Semantic Vector):
Gemini text-embedding-004 generates 768-dimensional dense vectors stored natively in Neon PostgreSQL using pgvector with HNSW indexing (M=16, efConstruction=64).

Channel B (Sparse Lexical Search):
PostgreSQL tsvector parses English token stems using standard BM25 ranking algorithms.

Reciprocal Rank Fusion (RRF Formula):
The fusion engine computes the harmonic score across both channels using constant k=60:
Score(d) = 1 / (60 + Dense_Rank) + 1 / (60 + Sparse_Rank)
This guarantees 100% precision on exact keywords while maintaining deep conceptual understanding.

=== Page 3 ===
4. Enterprise Security, SOC2 Compliance & Multi-Tenancy
Sutra implements strict multi-tenant data isolation. Every database query enforces row-level tenant filtering (where userId = authenticated_user_id). All vector chunks and stored documents are encrypted at rest using AES-256 and in transit via TLS 1.3.

Credit Rate Limiting & ACID Transactions:
To prevent quota circumvention, credit deductions occur inside atomic PostgreSQL transactions:
UPDATE users SET credits = credits - 1 WHERE id = userId AND credits >= 1 RETURNING credits.
If credits reach zero, requests are rejected with HTTP 403 Forbidden before invoking upstream LLM APIs.

=== Page 4 ===
5. Latency Benchmarks & Performance Metrics
- Time to First Token (TTFT): 42ms on edge serverless functions.
- Dense Vector Cosine Similarity Search: 8.4ms across 1,000,000 vectors in Neon pgvector.
- Sparse BM25 Search: 3.2ms.
- Reciprocal Rank Fusion overhead: <0.5ms.
- End-to-End Grounded Q&A Latency: 480ms average.

6. Conclusion & Roadmap
Sutra sets a new benchmark for multimodal AI platforms by marrying real-time streaming interfaces with mathematically rigorous hybrid information retrieval.`,
};
