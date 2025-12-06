import { z } from "zod";
import { TONES } from "./constants";

export const generateRequestSchema = z.object({
    topic: z.string().min(3, "Topic must be at least 3 characters").max(500, "Topic must be less than 500 characters"),
    tone: z.enum(["Professional", "Friendly", "Smart", "Storytelling"] as const),
});

export type GenerateRequest = z.infer<typeof generateRequestSchema>;

export const generatedPostSchema = z.object({
    hook: z.string(),
    body: z.string(),
    cta: z.string(),
    full: z.string(),
    hashtags: z.string(),
    characterCount: z.number(),
});

export const generateResponseSchema = z.object({
    success: z.boolean(),
    posts: z.array(generatedPostSchema).optional(),
    error: z.string().optional(),
});

export type GenerateResponse = z.infer<typeof generateResponseSchema>;

export const savedPostSchema = generatedPostSchema.extend({
    id: z.string(),
    topic: z.string(),
    tone: z.string(),
    createdAt: z.number(),
    isFavorite: z.boolean().default(false),
});

export type SavedPost = z.infer<typeof savedPostSchema>;
