import OpenAI from "openai";

// Prioritized list of free models for fallback
const FREE_MODELS = [
    "google/gemini-2.0-flash-exp:free",           // Primary: Fast, high quality
    "meta-llama/llama-3.3-70b-instruct:free",     // Fallback 1: Excellent for content
    "deepseek/deepseek-chat:free",                // Fallback 2: Strong reasoning
    "mistralai/mistral-small-3.1-24b-instruct:free", // Fallback 3: Reliable
    "google/gemma-3-27b:free",                    // Fallback 4: Good quality
    "amazon/nova-2-lite:free",                    // Fallback 5: Backup option
] as const;

const getOpenAIClient = () => {
    const apiKey = process.env.OPENROUTER_API_KEY;

    // Allow build to pass without key, but fail at runtime
    if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY is not set");
    }

    return new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: apiKey,
        defaultHeaders: {
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            "X-Title": "PostCraft",
        },
    });
};

// Helper function to attempt generation with a specific model
async function attemptGeneration(
    openai: OpenAI,
    model: string,
    systemPrompt: string,
    userPrompt: string
) {
    const completion = await openai.chat.completions.create({
        model,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" }, // Ensure JSON output
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("No content generated");

    return JSON.parse(content);
}

// Main function with multi-model fallback
export async function generatePostsWithFallback(systemPrompt: string, userPrompt: string) {
    const openai = getOpenAIClient();
    const errors: Array<{ model: string; error: string }> = [];

    // Try each model in sequence
    for (let i = 0; i < FREE_MODELS.length; i++) {
        const model = FREE_MODELS[i];

        try {
            console.log(`🤖 Attempting generation with model: ${model}`);
            const result = await attemptGeneration(openai, model, systemPrompt, userPrompt);

            // Success! Log which model worked
            console.log(`✅ Successfully generated posts using: ${model}`);
            if (i > 0) {
                console.log(`ℹ️  Note: Fell back to model #${i + 1} after ${i} failed attempt(s)`);
            }

            return {
                ...result,
                modelUsed: model, // Track which model was used
            };
        } catch (error: any) {
            const errorMessage = error?.message || "Unknown error";
            const isRateLimit = error?.status === 429 || errorMessage.includes("429");
            const isProviderError = error?.status === 400 || errorMessage.includes("400");
            const isAuthError = error?.status === 401 || error?.status === 403;

            // Log the failure
            console.warn(`❌ Model ${model} failed:`, {
                status: error?.status,
                message: errorMessage,
                isRateLimit,
                isProviderError,
            });

            errors.push({
                model,
                error: errorMessage,
            });

            // If it's an auth error, stop immediately (no point trying other models)
            if (isAuthError) {
                console.error(`🚨 Authentication error - check your API key`);
                throw new Error(`Authentication failed: ${errorMessage}`);
            }

            // If it's a rate limit or provider error and we have more models to try, continue
            if ((isRateLimit || isProviderError) && i < FREE_MODELS.length - 1) {
                console.log(`⏭️  ${isRateLimit ? 'Rate limit' : 'Provider error'} - trying next model...`);
                continue;
            }

            // If it's not a recoverable error and we're out of models, throw
            if (!isRateLimit && !isProviderError) {
                console.error(`🚨 Non-recoverable error encountered:`, error);
                throw new Error(`API Error: ${errorMessage}`);
            }
        }
    }

    // All models failed
    console.error("🚨 All models exhausted. Errors:", errors);
    throw new Error(
        "All AI models are currently experiencing rate limits. Please try again in a few minutes. " +
        "This is a temporary limitation of the free tier."
    );
}

// Legacy function for backward compatibility (now uses fallback)
export async function generatePosts(systemPrompt: string, userPrompt: string) {
    return generatePostsWithFallback(systemPrompt, userPrompt);
}
