import { sql } from "drizzle-orm";
import { db } from "@/db";

export interface RankedChunk {
  id: string;
  chunkIndex: number;
  pageNumber: number;
  content: string;
  denseRank: number | null;
  sparseRank: number | null;
  denseScore: number;
  sparseScore: number;
  rrfScore: number;
}

/**
 * Hybrid Search Engine using Neon PostgreSQL (pgvector + BM25)
 * 
 * Fuses Dense Semantic Vector Search (Cosine Similarity) with 
 * Sparse Lexical Keyword Search (BM25 Full-Text) via Reciprocal Rank Fusion (RRF k=60).
 */
export async function searchHybridChunks(
  documentId: string,
  query: string,
  queryEmbedding: number[],
  topK = 5
): Promise<RankedChunk[]> {
  const vectorString = `[${queryEmbedding.join(",")}]`;

  // 1. Dense Vector Search (Cosine Distance in pgvector)
  const denseQuery = sql`
    SELECT 
      id,
      chunk_index AS "chunkIndex",
      page_number AS "pageNumber",
      content,
      1 - (embedding <=> ${vectorString}::vector) AS score
    FROM document_chunks
    WHERE document_id = ${documentId}::uuid
      AND embedding IS NOT NULL
    ORDER BY embedding <=> ${vectorString}::vector ASC
    LIMIT 10;
  `;

  // 2. Sparse Full-Text Search (BM25 via tsvector / plainto_tsquery)
  const sparseQuery = sql`
    SELECT 
      id,
      chunk_index AS "chunkIndex",
      page_number AS "pageNumber",
      content,
      ts_rank_cd(to_tsvector('english', content), plainto_tsquery('english', ${query})) AS score
    FROM document_chunks
    WHERE document_id = ${documentId}::uuid
      AND (
        to_tsvector('english', content) @@ plainto_tsquery('english', ${query})
        OR content ILIKE ${`%${query.slice(0, 30)}%`}
      )
    ORDER BY score DESC
    LIMIT 10;
  `;

  const [denseRes, sparseRes] = await Promise.all([
    db.execute(denseQuery),
    db.execute(sparseQuery).catch((err) => {
      console.warn("Sparse search fallback warning:", err);
      return { rows: [] };
    }),
  ]);

  interface QueryRow {
    id: string;
    chunkIndex: number;
    pageNumber: number;
    content: string;
    score: number | string;
  }

  const denseRows = (denseRes.rows || []) as unknown as QueryRow[];
  const sparseRows = (sparseRes.rows || []) as unknown as QueryRow[];

  // 3. Reciprocal Rank Fusion (RRF with k=60)
  const RRF_K = 60;
  const chunkMap = new Map<string, RankedChunk>();

  // Map Dense ranks
  denseRows.forEach((row, idx) => {
    const rank = idx + 1;
    const denseScore = typeof row.score === "number" ? row.score : parseFloat(row.score) || 0;
    
    chunkMap.set(row.id, {
      id: row.id,
      chunkIndex: Number(row.chunkIndex),
      pageNumber: Number(row.pageNumber),
      content: row.content,
      denseRank: rank,
      sparseRank: null,
      denseScore: Math.max(0, Math.min(1, denseScore)),
      sparseScore: 0,
      rrfScore: 1 / (RRF_K + rank),
    });
  });

  // Map Sparse ranks and fuse
  sparseRows.forEach((row, idx) => {
    const rank = idx + 1;
    const sparseScore = typeof row.score === "number" ? row.score : parseFloat(row.score) || 0;
    const rrfIncrement = 1 / (RRF_K + rank);

    if (chunkMap.has(row.id)) {
      const existing = chunkMap.get(row.id)!;
      existing.sparseRank = rank;
      existing.sparseScore = sparseScore;
      existing.rrfScore += rrfIncrement;
    } else {
      chunkMap.set(row.id, {
        id: row.id,
        chunkIndex: Number(row.chunkIndex),
        pageNumber: Number(row.pageNumber),
        content: row.content,
        denseRank: null,
        sparseRank: rank,
        denseScore: 0,
        sparseScore: sparseScore,
        rrfScore: rrfIncrement,
      });
    }
  });

  // Sort by final combined RRF Score descending
  const sortedChunks = Array.from(chunkMap.values()).sort((a, b) => b.rrfScore - a.rrfScore);

  return sortedChunks.slice(0, topK);
}
