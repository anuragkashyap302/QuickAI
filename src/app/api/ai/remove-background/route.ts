import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import cloudinary from "@/lib/cloudinary";
import { db } from "@/db";
import { creations } from "@/db/schema";
import { deductUserCredits } from "@/lib/auth";

/**
 * POST /api/ai/remove-background
 * 
 * Uploads user image and applies Cloudinary background removal
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "Image file is required" }, { status: 400 });
    }

    // Deduct 2 credits
    const creditResult = await deductUserCredits(userId, 2);
    if (!creditResult.success) {
      return NextResponse.json({ success: false, error: creditResult.error }, { status: 403 });
    }

    // Convert file to base64 for Cloudinary
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Str = `data:${file.type};base64,${buffer.toString("base64")}`;

    const uploadRes = await cloudinary.uploader.upload(base64Str, {
      folder: "sutra_bg_removed",
      transformation: [
        {
          effect: "background_removal",
          background_removal: "remove_the_background",
        },
      ],
    });

    const secureUrl = uploadRes.secure_url;

    const [newCreation] = await db
      .insert(creations)
      .values({
        userId,
        type: "background-removal",
        title: `Background Removed: ${file.name}`,
        prompt: "Remove image background",
        content: secureUrl,
        imageUrl: secureUrl,
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
    console.error("Background removal error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to remove background";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
