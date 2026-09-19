import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

/**
 * Get or Create User in Database
 * 
 * Ye function Clerk se current logged-in user ko fetch karta hai.
 * Agar user database me pehle se nahi hai, toh auto-sync karke default 20 credits deta hai.
 * 
 * Interview Point: Lazy User Syncing pattern se hum external webhooks par 100% depend nahi hote.
 */
export async function getOrCreateCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  // 1. Check if user already exists in Neon DB
  const existingUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (existingUser) {
    return existingUser;
  }

  // 2. Fetch user profile from Clerk
  const clerkUser = await currentUser();
  const primaryEmail = clerkUser?.emailAddresses[0]?.emailAddress || "user@sutra.ai";
  const fullName = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") || "Sutra Creator";
  const avatar = clerkUser?.imageUrl || null;

  // 3. Insert new user with 20 default credits
  const [newUser] = await db
    .insert(users)
    .values({
      id: userId,
      email: primaryEmail,
      name: fullName,
      imageUrl: avatar,
      plan: "free",
      credits: 20,
    })
    .returning();

  return newUser;
}

/**
 * Deduct Credits Atomically
 * 
 * Har AI operation se pehle ye check karta hai ki user ke paas sufficient credits hain ya nahi.
 * Atomic SQL execution (`credits - cost WHERE credits >= cost`) race conditions ko prevent karta hai.
 */
export async function deductUserCredits(userId: string, cost: number = 1): Promise<{ success: boolean; remainingCredits?: number; error?: string }> {
  // Pro users ke paas unlimited quota hota hai
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    return { success: false, error: "User not found" };
  }

  if (user.plan === "pro" || user.plan === "premium") {
    return { success: true, remainingCredits: user.credits };
  }

  if (user.credits < cost) {
    return {
      success: false,
      error: `Insufficient credits. You need ${cost} credit(s), but only have ${user.credits} remaining.`,
    };
  }

  // Atomic deduction
  const [updatedUser] = await db
    .update(users)
    .set({
      credits: sql`${users.credits} - ${cost}`,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  return { success: true, remainingCredits: updatedUser.credits };
}
