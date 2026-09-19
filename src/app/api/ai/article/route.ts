import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { ai, DEFAULT_AI_MODEL } from "@/lib/ai";
import { db } from "@/db";
import { creations } from "@/db/schema";
import { deductUserCredits } from "@/lib/auth";

// Request Body Validation Schema
const generateArticleSchema = z.object({
  prompt: z.string().min(3, "Prompt must be at least 3 characters long"),
  title: z.string().optional().default("Untitled Article"),
  length: z.number().optional().default(800),
  publish: z.boolean().optional().default(false),
});

/**
 * POST /api/ai/article
 * 
 * Next.js 15 Route Handler for Article Generation
 * 
 * Flow:
 * 1. Auth check via Clerk
 * 2. Payload validation via Zod
 * 3. Atomic credit deduction in Neon Postgres
 * 4. Gemini 2.5 Flash LLM Generation
 * 5. Save output to Drizzle creations table
 * 6. Return response
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Please sign in to continue." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = generateArticleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { prompt, title, length, publish } = parsed.data;

    // Credit Deduction (1 Credit per article)
    const creditResult = await deductUserCredits(userId, 1);
    if (!creditResult.success) {
      return NextResponse.json(
        { success: false, error: creditResult.error },
        { status: 403 }
      );
    }

    // Google Gemini Generation
    const response = await ai.models.generateContent({
      model: DEFAULT_AI_MODEL,
      contents: [
        {
          role: "user",
          parts: [{ text: `Write a comprehensive, well-structured markdown article on the topic: "${prompt}". Use engaging headings, bullet points, and actionable takeaways.` }],
        },
      ],
      config: {
        temperature: 0.7,
        maxOutputTokens: length,
      },
    });

    const content = response.text || "Failed to generate content.";

    // Save creation into Neon DB via Drizzle
    const [newCreation] = await db
      .insert(creations)
      .values({
        userId,
        type: "article",
        title: title || prompt.slice(0, 50),
        prompt,
        content,
        publish,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        id: newCreation.id,
        title: newCreation.title,
        content: newCreation.content,
        remainingCredits: creditResult.remainingCredits,
      },
    });
  } catch (error: unknown) {
    console.error("Article Generation Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
