import { NextResponse } from "next/server";
import { generatePostsWithFallback } from "@/lib/openrouter";
import { buildPrompt } from "@/lib/prompts";
import { GenerateRequest, GeneratedPost } from "@/types";

export async function POST(request: Request) {
    try {
        const body: GenerateRequest = await request.json();
        const { topic, tone, length } = body;

        if (!topic || topic.length > 500) {
            return NextResponse.json(
                { success: false, error: "Invalid topic length" },
                { status: 400 }
            );
        }

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
