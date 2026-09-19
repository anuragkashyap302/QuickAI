import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import cloudinary from "@/lib/cloudinary";
import { db } from "@/db";
import { creations } from "@/db/schema";
import { deductUserCredits } from "@/lib/auth";

/**
 * POST /api/ai/remove-object
 * 
 * Removes target object generatively via Cloudinary
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("image") as File;
    const object = formData.get("object") as string;

    if (!file || !object) {
      return NextResponse.json({ success: false, error: "Image and target object name are required" }, { status: 400 });
    }

    // Deduct 2 credits
    const creditResult = await deductUserCredits(userId, 2);
    if (!creditResult.success) {
      return NextResponse.json({ success: false, error: creditResult.error }, { status: 403 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Str = `data:${file.type};base64,${buffer.toString("base64")}`;

    const uploadRes = await cloudinary.uploader.upload(base64Str, {
      folder: "sutra_object_removed",
    });

    const transformedUrl = cloudinary.url(uploadRes.public_id, {
      transformation: [{ effect: `gen_remove:${object}` }],
      resource_type: "image",
      secure: true,
    });

    const [newCreation] = await db
      .insert(creations)
      .values({
        userId,
        type: "object-removal",
        title: `Removed ${object} from ${file.name}`,
        prompt: `Remove object: ${object}`,
        content: transformedUrl,
        imageUrl: transformedUrl,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        id: newCreation.id,
        imageUrl: transformedUrl,
        remainingCredits: creditResult.remainingCredits,
      },
    });
  } catch (error: unknown) {
    console.error("Object removal error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to remove object";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
