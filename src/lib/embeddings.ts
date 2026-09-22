import { ai } from "./ai";

/**
 * 768-dimensional Google Gemini Embedding Generator (text-embedding-004)
 * 
 * Ye helper text ko 768-dimensional dense vector me convert karta hai.
 * Neon Postgres ke `pgvector` index me Cosine Distance query ke liye ye embeddings store hoti hain.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const cleanText = text.replace(/\n+/g, " ").trim();
    if (!cleanText) {
      return new Array(768).fill(0);
    }

    const response = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: cleanText,
      config: {
        outputDimensionality: 768,
      },
    });

    const values = response.embeddings?.[0]?.values;
    if (!values || values.length === 0) {
      throw new Error("Gemini returned empty embedding values");
    }

    return values;
  } catch (error) {
    console.error("Embedding generation failed:", error);
    throw error;
  }
}

/**
 * Batch Embeddings Generator
 * 
 * Multiple chunks ko efficiently embed karne ke liye.
 */
export async function generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = [];
  
  // Gemini text-embedding-004 can process in sequential or throttled chunks
  for (const text of texts) {
    const emb = await generateEmbedding(text);
    embeddings.push(emb);
  }

  return embeddings;
}

export interface DocumentChunkData {
  chunkIndex: number;
  pageNumber: number;
  content: string;
}

/**
 * Layout-Aware Sliding Window Text Chunker
 * 
 * Multi-page document text ko semantic chunks me divide karta hai jabki page numbers ko preserve karta hai.
 * Default: ~250 words per chunk with 40-word overlap for contextual coherence.
 */
export function chunkDocumentPages(
  pages: { pageNumber: number; text: string }[],
  maxWords = 250,
  overlap = 40
): DocumentChunkData[] {
  const chunks: DocumentChunkData[] = [];
  let globalChunkIndex = 0;

  for (const page of pages) {
    const pageClean = page.text.trim();
    if (!pageClean) continue;

    const words = pageClean.split(/\s+/);
    if (words.length <= maxWords) {
      chunks.push({
        chunkIndex: globalChunkIndex++,
        pageNumber: page.pageNumber,
        content: words.join(" "),
      });
      continue;
    }

    let startIndex = 0;
    while (startIndex < words.length) {
      const endIndex = Math.min(startIndex + maxWords, words.length);
      const chunkWords = words.slice(startIndex, endIndex);
      
      chunks.push({
        chunkIndex: globalChunkIndex++,
        pageNumber: page.pageNumber,
        content: chunkWords.join(" "),
      });

      if (endIndex >= words.length) break;
      startIndex += maxWords - overlap;
    }
  }

  return chunks;
}
