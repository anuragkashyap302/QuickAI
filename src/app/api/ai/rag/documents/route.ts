import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { documents, documentChunks } from "@/db/schema";

/**
 * GET /api/ai/rag/documents
 * 
 * Returns all documents for the authenticated user, or chunks for a specific document.
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get("documentId");

    if (documentId) {
      // Return specific document with chunks
      const [doc] = await db
        .select()
        .from(documents)
        .where(eq(documents.id, documentId));

      if (!doc) {
        return NextResponse.json({ success: false, error: "Document not found" }, { status: 404 });
      }

      const chunks = await db
        .select({
          id: documentChunks.id,
          chunkIndex: documentChunks.chunkIndex,
          pageNumber: documentChunks.pageNumber,
          content: documentChunks.content,
        })
        .from(documentChunks)
        .where(eq(documentChunks.documentId, documentId))
        .orderBy(documentChunks.chunkIndex);

      return NextResponse.json({
        success: true,
        data: {
          document: doc,
          chunks,
        },
      });
    }

    // Return list of all documents for user
    const userDocs = await db
      .select()
      .from(documents)
      .where(eq(documents.userId, userId))
      .orderBy(desc(documents.createdAt));

    return NextResponse.json({
      success: true,
      data: userDocs,
    });
  } catch (error: unknown) {
    console.error("Fetch documents error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch documents";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

/**
 * DELETE /api/ai/rag/documents
 * 
 * Deletes a document and cascades deletion of its vector chunks.
 */
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get("documentId");

    if (!documentId) {
      return NextResponse.json({ success: false, error: "documentId is required" }, { status: 400 });
    }

    // Delete chunks first (or cascaded by DB FK)
    await db.delete(documentChunks).where(eq(documentChunks.documentId, documentId));
    await db.delete(documents).where(eq(documents.id, documentId));

    return NextResponse.json({ success: true, message: "Document deleted successfully" });
  } catch (error: unknown) {
    console.error("Delete document error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete document";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
