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
            model: "meta-llama/llama-3.2-3b-instruct:free", // Free model for testing
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            response_format: { type: "json_object" }, // Ensure JSON output
        });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error("No content generated");

        return JSON.parse(content);
    } catch (error) {
        console.error("OpenRouter API Error:", error);
        throw error;
    }
}
