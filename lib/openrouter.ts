import OpenAI from "openai";

// Direct Moonshot API models
const MOONSHOT_ONLY_MODELS = [
    "kimi-k2",
    "kimi-k2.5",
    "kimi-k2-thinking",
    "moonshot-v1-8k",
] as const;

// NVIDIA NIM specific models (Prioritize instruct for speed on text tasks)
const NVIDIA_KIMI_MODELS = [
    "moonshotai/kimi-k2-instruct",
    "moonshotai/kimi-k2.5",
    "moonshotai/kimi-k2-thinking",
] as const;

// Prioritized list of free models for fallback (OpenRouter)
const FREE_MODELS = [
    "meta-llama/llama-4-scout:free",
    "meta-llama/llama-4-maverick:free",
    "deepseek/deepseek-r1:free",
    "google/gemini-2.0-flash:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "mistralai/mistral-small-3.1-24b-instruct:free",
    "google/gemma-3-27b:free",
    "qwen/qwen-2.5-72b-instruct:free",
    "amazon/nova-2-lite:free",
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

// Main function with multi-provider and multi-model fallback
export async function generatePostsWithFallback(systemPrompt: string, userPrompt: string) {
    const errors: Array<{ model: string; error: string }> = [];

    // 1. Try Kimi first if API key is present
    let kimiHadFatalError = false;
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

                // If it's an auth error and it's our only Kimi key, don't keep trying other Kimi models if it's 401
                if (error?.status === 401) {
                    kimiHadFatalError = true;
                    break;
                }
            }
        }
    }

    // 2. Fallback to OpenRouter (only if Kimi didn't have a fatal auth error)
    if (kimiHadFatalError) {
        const lastError = errors[errors.length - 1];
        throw new Error(`Kimi Authentication Failed: ${lastError.error}. Please check your KIMI_API_KEY in .env.local and restart the server.`);
    }

    const openai = getOpenAIClient();

    // Try each model in sequence
    for (let i = 0; i < FREE_MODELS.length; i++) {
        const model = FREE_MODELS[i];

        // First attempt with JSON mode
        try {
            console.log(`🤖 Attempting generation with OpenRouter model: ${model}`);
            const result = await attemptGeneration(openai, model, systemPrompt, userPrompt, true);
            return { ...result, modelUsed: model };
        } catch (error: any) {
            const isProviderError = error?.status === 400 || error?.message?.includes("400");

            // If model doesn't support JSON mode (400 error), try once more without it
            if (isProviderError) {
                try {
                    console.log(`🔄 Retrying ${model} without JSON mode...`);
                    const result = await attemptGeneration(openai, model, systemPrompt, userPrompt, false);
                    return { ...result, modelUsed: model };
                } catch (retryError) {
                    // Fall through to standard error handling
                }
            }

            const err = error as { message?: string; status?: number };
            const errorMessage = err?.message || "Unknown error";
            const isRateLimit = err?.status === 429 || errorMessage.includes("429") || errorMessage.includes("limit");
            const isAuthError = err?.status === 401 || err?.status === 403;

            // Log the failure
            console.warn(`❌ Model ${model} failed:`, {
                status: err?.status,
                message: errorMessage,
                isRateLimit,
            });

            errors.push({ model, error: errorMessage });

            if (isAuthError) {
                console.error(`🚨 Authentication error - check your API key`);
                // If this is OpenRouter auth error, and we already tried Kimi (or Kimi isn't setup), we have a problem.
                // But let's continue if there are more models (unlikely to fix auth though).
                throw new Error(`Authentication failed: ${errorMessage}`);
            }

            // Continue to next model if recoverable
            if ((isRateLimit || isProviderError || err?.status === 404) && i < FREE_MODELS.length - 1) {
                continue;
            }

            // Throw if we're out of models or it's a fatal error
            if (i === FREE_MODELS.length - 1) {
                break;
            }
        }
    }

    // All models failed
    console.error("🚨 All models exhausted. Errors:", errors);
    throw new Error(
        "All AI models are currently experiencing issues or rate limits. Please try again later. " +
        (errors.length > 0 ? `Last error: ${errors[errors.length - 1].error}` : "")
    );
}

// Legacy function for backward compatibility (now uses fallback)
export async function generatePosts(systemPrompt: string, userPrompt: string) {
    return generatePostsWithFallback(systemPrompt, userPrompt);
}
