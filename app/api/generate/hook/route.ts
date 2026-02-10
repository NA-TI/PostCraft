import { NextResponse } from "next/server";
import { generatePostsWithFallback } from "@/lib/openrouter";
import { hookRequestSchema } from "@/lib/validation";
import { buildHookPrompt } from "@/lib/prompts";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validation = hookRequestSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: validation.error.issues.map((e) => e.message).join(", ")
                },
                { status: 400 }
            );
        }

        const { body: postBody, tone } = validation.data;

        const { system, user } = buildHookPrompt(postBody, tone);
        const result = await generatePostsWithFallback(system, user);

        // Result will contain { hooks: [...] } if prompts are followed
        // We return the raw result which already has the JSON structure
        return NextResponse.json({
            success: true,
            hooks: result.hooks,
            modelUsed: result.modelUsed,
        });
    } catch (error) {
        console.error("Hook generation error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to generate hooks";
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}
