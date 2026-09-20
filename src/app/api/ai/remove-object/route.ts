import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import cloudinary from "@/lib/cloudinary";
import { db } from "@/db";
import { creations } from "@/db/schema";
import { deductUserCredits } from "@/lib/auth";

/**
 * POST /api/ai/remove-object
 * 
 * Performs Dual-Mode AI Inpainting:
 * 1. Mode 'remove': Generative Object Eraser with background synthesis (`gen_remove:prompt_${object}`)
 * 2. Mode 'replace': Generative Object Replacement (`gen_replace:from_${object};to_${replacementPrompt}`)
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("image") as File;
    const object = (formData.get("object") as string) || "object";
    const mode = (formData.get("mode") as string) || "remove";
    const replacementPrompt = formData.get("replacementPrompt") as string;

    if (!file) {
      return NextResponse.json({ success: false, error: "Image file is required" }, { status: 400 });
    }

    if (mode === "replace" && !replacementPrompt) {
      return NextResponse.json({ success: false, error: "Replacement prompt is required for replace mode" }, { status: 400 });
    }

    // Deduct 2 credits for inpainting
    const creditResult = await deductUserCredits(userId, 2);
    if (!creditResult.success) {
      return NextResponse.json({ success: false, error: creditResult.error }, { status: 403 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Str = `data:${file.type};base64,${buffer.toString("base64")}`;

    const uploadRes = await cloudinary.uploader.upload(base64Str, {
      folder: "sutra_inpainting_studio",
    });

    let transformationEffect = "";
    let actionTitle = "";
    let actionPrompt = "";

    if (mode === "replace") {
      // Cloudinary Generative Replacement syntax: gen_replace:from_item;to_newItem
      transformationEffect = `gen_replace:from_${encodeURIComponent(object)};to_${encodeURIComponent(replacementPrompt)}`;
      actionTitle = `Replaced ${object} with ${replacementPrompt}`;
      actionPrompt = `Replace ${object} with ${replacementPrompt}`;
    } else {
      // Cloudinary Generative Eraser syntax: gen_remove:prompt_item
      transformationEffect = `gen_remove:prompt_${encodeURIComponent(object)}`;
      actionTitle = `Erased ${object} from image`;
      actionPrompt = `Remove object: ${object}`;
    }

    const transformedUrl = cloudinary.url(uploadRes.public_id, {
      transformation: [{ effect: transformationEffect }],
      resource_type: "image",
      secure: true,
    });

    const [newCreation] = await db
      .insert(creations)
      .values({
        userId,
        type: "object-removal",
        title: actionTitle,
        prompt: actionPrompt,
        content: transformedUrl,
        imageUrl: transformedUrl,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        id: newCreation.id,
        imageUrl: transformedUrl,
        originalUrl: uploadRes.secure_url,
        remainingCredits: creditResult.remainingCredits,
      },
    });
  } catch (error: unknown) {
    console.error("Inpainting API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to inpaint image";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
