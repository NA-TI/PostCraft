import { NextResponse } from "next/server";
import { generatePostsWithFallback } from "@/lib/openrouter";
import { generateRequestSchema } from "@/lib/validation";
import { buildPrompt } from "@/lib/prompts";
import { GeneratedPost } from "@/types";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validation = generateRequestSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: validation.error.issues.map((e) => e.message).join(", ")
                },
                { status: 400 }
            );
        }

        const { topic, tone, length } = validation.data;

        const { system, user } = buildPrompt(topic, tone, length || "Medium");
        const result = await generatePostsWithFallback(system, user);

        // Add character counts to response
        const postsWithCounts = result.posts.map((post: GeneratedPost) => ({
            ...post,
            characterCount: post.full.length,
        }));

        // Create response with model tracking header
        const response = NextResponse.json({
            success: true,
            posts: postsWithCounts,
            modelUsed: result.modelUsed,
        });

        // Add header to track which model was used (for debugging)
        if (result.modelUsed) {
            response.headers.set("X-Model-Used", result.modelUsed);
        }

        return response;
    } catch (error) {
        console.error("Generation error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to generate posts";
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}
