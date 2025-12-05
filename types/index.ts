export type Tone = "Friendly" | "Smart" | "Professional" | "Storytelling";

export interface GeneratedPost {
    hook: string;
    body: string;
    cta: string;
    full: string;
    characterCount: number;
}

export interface GenerateRequest {
    topic: string;
    tone: Tone;
}

export interface GenerateResponse {
    success: boolean;
    posts: GeneratedPost[];
    error?: string;
}
