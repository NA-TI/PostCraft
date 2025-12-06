import OpenAI from "openai";

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "PostCraft",
    },
});

export async function generatePosts(systemPrompt: string, userPrompt: string) {
    try {
        const completion = await openai.chat.completions.create({
            model: "google/gemini-2.0-flash-exp:free", // Best free model for content generation
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            response_format: { type: "json_object" }, // Ensure JSON output
        });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error("No content generated");

        return JSON.parse(content);
    } catch (error: any) {
        console.error("OpenRouter API Error:", error);

        // Handle rate limit errors specifically
        if (error?.status === 429 || error?.message?.includes("429")) {
            throw new Error("Rate limit exceeded. Please wait a moment and try again.");
        }

        // Handle other API errors
        if (error?.status) {
            throw new Error(`API Error (${error.status}): ${error.message || "Unknown error"}`);
        }

        throw error;
    }
}
