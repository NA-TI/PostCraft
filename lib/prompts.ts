import { Tone } from "@/types";

const SYSTEM_PROMPT = `You are an expert LinkedIn content strategist specializing in creating engaging, authentic posts that drive meaningful engagement.

CRITICAL RULES:
1. Character limit: 900-1,200 characters (strict)
2. First 140 characters MUST hook the reader (mobile preview)
3. Use short paragraphs (2-3 lines max)
4. End with a clear, engaging question or CTA
5. Sound human, not robotic
6. Avoid hashtags in the generated text (we add them separately if needed)
7. Avoid overly salesy language or generic platitudes

OUTPUT FORMAT:
Return exactly 2 distinct versions of the post as a JSON object with this structure:
{
  "posts": [
    {
      "hook": "First 1-2 lines",
      "body": "Main content with line breaks (excluding hook and cta)",
      "cta": "Closing question or CTA",
      "full": "Complete post text including hook, body, and cta"
    },
    { ... }
  ]
}`;

const TONE_MODIFIERS: Record<Tone, string> = {
    Friendly: `
    - Use "I", "you", "we" pronouns
    - Include 1-2 relevant emojis
    - Sound like you're chatting with a colleague over coffee
    - Be warm, encouraging, and approachable
    - Use contractions (I'm, you're, it's)
  `,
    Smart: `
    - Lead with a counterintuitive insight or observation
    - Use analytical language
    - Sound like an expert sharing valuable knowledge
    - Avoid emojis
    - Be thought-provoking without being preachy
  `,
    Professional: `
    - Use formal, polished language
    - Focus on achievements, skills, and results
    - Avoid emojis entirely
    - Sound like a thought leader or executive
    - Be concise and results-oriented
  `,
    Storytelling: `
    - Start with a relatable struggle, moment, or question
    - Build a narrative arc (setup → tension → resolution)
    - Use vivid, sensory details
    - Create emotional connection
    - Use "I" perspective for authenticity
  `
};

export function buildPrompt(topic: string, tone: Tone): { system: string; user: string } {
    const userPrompt = `
    Topic: ${topic}
    Tone: ${tone}

    Additional instructions for ${tone} tone:
    ${TONE_MODIFIERS[tone]}

    Generate 2 LinkedIn posts about this topic.
    Version 1: Lead with a personal angle or story.
    Version 2: Lead with an insight or observation.
  `;

    return {
        system: SYSTEM_PROMPT,
        user: userPrompt
    };
}
