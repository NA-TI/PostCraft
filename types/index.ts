import { z } from "zod";
import { generateResponseSchema, generatedPostSchema, savedPostSchema } from "@/lib/validation";

export type Tone = "Friendly" | "Smart" | "Professional" | "Storytelling";

export type GeneratedPost = z.infer<typeof generatedPostSchema>;
export interface Template {
    id: string;
    name: string;
    description: string;
    icon: string;
}

export interface GenerateRequest {
    topic: string;
    tone: Tone;
    length: "Short" | "Medium" | "Long";
    referencePost?: string;
    templateId?: string;
}
export type GenerateResponse = z.infer<typeof generateResponseSchema>;
export type SavedPost = z.infer<typeof savedPostSchema>;
