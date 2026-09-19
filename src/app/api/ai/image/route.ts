import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import axios from "axios";
import cloudinary from "@/lib/cloudinary";
import { db } from "@/db";
import { creations } from "@/db/schema";
import { deductUserCredits } from "@/lib/auth";

const generateImageSchema = z.object({
  prompt: z.string().min(3, "Prompt is required"),
  style: z.string().optional().default("Realistic"),
  publish: z.boolean().optional().default(false),
});

/**
 * POST /api/ai/image
 * 
 * Text-to-Image Generation via ClipDrop + Cloudinary Storage
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = generateImageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { prompt, style, publish } = parsed.data;

    // Deduct 2 credits for image generation
    const creditResult = await deductUserCredits(userId, 2);
    if (!creditResult.success) {
      return NextResponse.json({ success: false, error: creditResult.error }, { status: 403 });
    }

    const styledPrompt = `${prompt}, ${style} style, high quality, 8k resolution, detailed`;

    // 1. Call ClipDrop text-to-image API
    const formData = new FormData();
    formData.append("prompt", styledPrompt);

    const clipDropRes = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
      headers: {
        "x-api-key": process.env.CLIP_DROP_API_KEY || "",
      },
      responseType: "arraybuffer",
    });

    // 2. Convert to base64 & upload to Cloudinary
    const base64Image = `data:image/png;base64,${Buffer.from(clipDropRes.data, "binary").toString("base64")}`;
    const uploadRes = await cloudinary.uploader.upload(base64Image, {
      folder: "sutra_ai_creations",
    });

    const secureUrl = uploadRes.secure_url;

    // 3. Save to Neon DB via Drizzle
    const [newCreation] = await db
      .insert(creations)
      .values({
        userId,
        type: "image",
        title: `AI Image: ${prompt.slice(0, 30)}`,
        prompt: styledPrompt,
        content: secureUrl,
        imageUrl: secureUrl,
        publish,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        id: newCreation.id,
        imageUrl: secureUrl,
        remainingCredits: creditResult.remainingCredits,
      },
    });
  } catch (error: unknown) {
    console.error("Image generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate image";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
