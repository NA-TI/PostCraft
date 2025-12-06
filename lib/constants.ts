export const APP_CONFIG = {
    name: "PostCraft",
    version: "1.0.0",
    description: "Turn your ideas into polished LinkedIn posts in seconds.",
    maxInputLength: 500,
    maxHistoryItems: 50,
} as const;

export const POST_LENGTHS = {
    SHORT: { label: "Short", min: 600, max: 900, description: "Punchy and direct" },
    MEDIUM: { label: "Medium", min: 900, max: 1200, description: "Balanced detail" },
    LONG: { label: "Long", min: 1200, max: 1500, description: "Deep dive" },
} as const;

export const STORAGE_KEYS = {
    POSTS: "postcraft_posts",
    SETTINGS: "postcraft_settings",
    THEME: "postcraft_theme",
} as const;

export const API_ENDPOINTS = {
    GENERATE: "/api/generate",
} as const;

export const TONES = [
    { value: "Professional", label: "Professional", emoji: "👔" },
    { value: "Friendly", label: "Friendly", emoji: "👋" },
    { value: "Smart", label: "Smart", emoji: "💡" },
    { value: "Storytelling", label: "Storytelling", emoji: "📖" },
] as const;
