import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { creations } from "@/db/schema";

/**
 * POST /api/community/like
 * 
 * Toggles like on a public creation using atomic PostgreSQL array operations.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized: Please sign in to like" }, { status: 401 });
    }

    const { creationId } = await req.json();

    if (!creationId) {
      return NextResponse.json({ success: false, error: "creationId is required" }, { status: 400 });
    }

    // 1. Fetch current creation likes
    const [creation] = await db
      .select({ id: creations.id, likes: creations.likes, likesCount: creations.likesCount })
      .from(creations)
      .where(eq(creations.id, creationId));

    if (!creation) {
      return NextResponse.json({ success: false, error: "Creation not found" }, { status: 404 });
    }

    const currentLikes = creation.likes || [];
    const hasLiked = currentLikes.includes(userId);

    let updatedLikesCount = 0;
    let newHasLiked = false;

    if (hasLiked) {
      // Unlike: Remove userId from array and decrement count
      const [updated] = await db
        .update(creations)
        .set({
          likes: sql`array_remove(COALESCE(${creations.likes}, ARRAY[]::text[]), ${userId})`,
          likesCount: sql`GREATEST(0, COALESCE(${creations.likesCount}, 0) - 1)`,
        })
        .where(eq(creations.id, creationId))
        .returning({ likesCount: creations.likesCount });

      updatedLikesCount = updated?.likesCount ?? Math.max(0, (creation.likesCount || 1) - 1);
      newHasLiked = false;
    } else {
      // Like: Append userId to array and increment count
      const [updated] = await db
        .update(creations)
        .set({
          likes: sql`array_append(COALESCE(${creations.likes}, ARRAY[]::text[]), ${userId})`,
          likesCount: sql`COALESCE(${creations.likesCount}, 0) + 1`,
        })
        .where(eq(creations.id, creationId))
        .returning({ likesCount: creations.likesCount });

      updatedLikesCount = updated?.likesCount ?? (creation.likesCount || 0) + 1;
      newHasLiked = true;
    }

    return NextResponse.json({
      success: true,
      data: {
        creationId,
        likesCount: updatedLikesCount,
        hasLiked: newHasLiked,
      },
    });
  } catch (error: unknown) {
    console.error("Like toggle error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to toggle like";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
