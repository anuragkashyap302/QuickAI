import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { creations } from "@/db/schema";
import { desc, eq, and } from "drizzle-orm";

/**
 * GET /api/user/creations
 * 
 * Logged-in user ki saari creations fetch karta hai.
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userCreations = await db.query.creations.findMany({
      where: eq(creations.userId, userId),
      orderBy: [desc(creations.createdAt)],
    });

    return NextResponse.json({
      success: true,
      data: userCreations,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch creations";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/creations?id=...
 * 
 * Specific creation ko delete karta hai (Multi-tenant security check ke saath).
 */
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const creationId = searchParams.get("id");

    if (!creationId || isNaN(Number(creationId))) {
      return NextResponse.json(
        { success: false, error: "Valid numeric Creation ID is required" },
        { status: 400 }
      );
    }

    // Delete query with AND user_id = userId (Security: User cannot delete someone else's item)
    await db
      .delete(creations)
      .where(and(eq(creations.id, Number(creationId)), eq(creations.userId, userId)));

    return NextResponse.json({
      success: true,
      message: "Creation deleted successfully",
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to delete creation";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
