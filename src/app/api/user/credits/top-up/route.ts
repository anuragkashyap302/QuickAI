import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getOrCreateCurrentUser } from "@/lib/auth";

/**
 * POST /api/user/credits/top-up
 * 
 * Atomically refills +20 creation credits in Neon PostgreSQL.
 * Used for instant test top-ups and simulated checkout success.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Ensure user exists first
    await getOrCreateCurrentUser();

    // Atomic increment of 20 credits
    const [updatedUser] = await db
      .update(users)
      .set({
        credits: sql`credits + 20`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({ credits: users.credits, plan: users.plan });

    if (!updatedUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        credits: updatedUser.credits,
        plan: updatedUser.plan,
        message: "Successfully added 20 creation credits!",
      },
    });
  } catch (error: unknown) {
    console.error("Credit top-up error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to top up credits";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
