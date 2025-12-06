import { z } from "zod";
import { generateRequestSchema, generateResponseSchema, generatedPostSchema, savedPostSchema } from "@/lib/validation";

export type Tone = "Friendly" | "Smart" | "Professional" | "Storytelling";

export type GeneratedPost = z.infer<typeof generatedPostSchema>;
export interface GenerateRequest {
    topic: string;
    tone: Tone;
    length: "Short" | "Medium" | "Long";
}
export type GenerateResponse = z.infer<typeof generateResponseSchema>;
export type SavedPost = z.infer<typeof savedPostSchema>;

export interface PostHistoryItem extends SavedPost { }
