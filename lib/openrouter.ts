import OpenAI from "openai";

// NVIDIA NIM specific models (Prioritize instruct for speed on text tasks)
const NVIDIA_KIMI_MODELS = [
    "moonshotai/kimi-k2.5",
    "moonshotai/kimi-k2-instruct",
    "moonshotai/kimi-k2-thinking",
] as const;

// Direct Moonshot API models
const MOONSHOT_ONLY_MODELS = [
    "kimi-k2.5",
    "kimi-k2",
    "kimi-k2-thinking",
    "moonshot-v1-8k",
] as const;

const getAIClient = (provider: 'openrouter' | 'kimi') => {
    if (provider === 'kimi') {
        const rawKey = process.env.KIMI_API_KEY;
        if (!rawKey) throw new Error("KIMI_API_KEY is not set");

        const apiKey = rawKey.trim();
        const isNVIDIA = apiKey.startsWith("nvapi-");
        const baseURL = isNVIDIA ? "https://integrate.api.nvidia.com/v1" : "https://api.moonshot.cn/v1";

        console.log(`🌐 Provider: Kimi | API Type: ${isNVIDIA ? 'NVIDIA NIM' : 'Moonshot Direct'} | BaseURL: ${baseURL}`);

        return new OpenAI({
            baseURL,
            apiKey,
        });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set");

    return new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: apiKey,
        defaultHeaders: {
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            "X-Title": "PostCraft",
        },
    });
};

const getOpenAIClient = () => getAIClient('openrouter');

async function attemptGeneration(
    openai: OpenAI,
    model: string,
    systemPrompt: string,
    userPrompt: string,
    useJsonMode: boolean = true
) {
    const completion = await openai.chat.completions.create({
        model,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ],
        ...(useJsonMode ? { response_format: { type: "json_object" } } : {}),
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("No content generated");

    try {
        // Find JSON block if not in JSON mode or if model wrapped it in backticks
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : content;
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("JSON Parse Error. Raw content:", content);
        throw new Error("Failed to parse AI response as JSON");
    }
}

// Main function with Kimi-exclusive generation
export async function generatePostsWithFallback(systemPrompt: string, userPrompt: string) {
    const errors: Array<{ model: string; error: string }> = [];

    // 1. Try Kimi first if API key is present
    if (process.env.KIMI_API_KEY) {
        const rawKey = process.env.KIMI_API_KEY.trim();
        const isNVIDIA = rawKey.startsWith("nvapi-");
        const modelsToTry = isNVIDIA ? NVIDIA_KIMI_MODELS : MOONSHOT_ONLY_MODELS;

        const kimiClient = getAIClient('kimi');
        for (const model of modelsToTry) {
            try {
                console.log(`🤖 Attempting generation with Kimi model: ${model}`);
                const result = await attemptGeneration(kimiClient, model, systemPrompt, userPrompt, true);
                return { ...result, modelUsed: `kimi:${model}` };
            } catch (error: any) {
                console.warn(`❌ Kimi model ${model} failed:`, error?.message || "Unknown error");
                errors.push({ model: `kimi:${model}`, error: error?.message || "Unknown error" });

                // If it's an auth error, we should fail fast
                if (error?.status === 401 || error?.status === 403) {
                    throw new Error(`Kimi Authentication Failed: ${error.message}. Please check your KIMI_API_KEY.`);
                }

                // Continue to next Kimi model if it's a rate limit or other recoverable error
            }
        }
    } else {
        throw new Error("KIMI_API_KEY is not set. Please add it to your .env.local file.");
    }

    // All Kimi models failed
    console.error("🚨 All Kimi models exhausted. Errors:", errors);
    throw new Error(
        "Kimi AI is currently experiencing issues or rate limits. Please try again later. " +
        (errors.length > 0 ? `Last error: ${errors[errors.length - 1].error}` : "")
    );
}

// Legacy function for backward compatibility
export async function generatePosts(systemPrompt: string, userPrompt: string) {
    return generatePostsWithFallback(systemPrompt, userPrompt);
}
