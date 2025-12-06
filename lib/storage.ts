import { SavedPost } from "./validation";
import { STORAGE_KEYS } from "./constants";

export const storage = {
    getPosts: (): SavedPost[] => {
        if (typeof window === "undefined") return [];
        try {
            const posts = localStorage.getItem(STORAGE_KEYS.POSTS);
            return posts ? JSON.parse(posts) : [];
        } catch (error) {
            console.error("Error reading posts from storage:", error);
            return [];
        }
    },

    savePost: (post: SavedPost): void => {
        try {
            const posts = storage.getPosts();
            const newPosts = [post, ...posts];
            localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(newPosts));
        } catch (error) {
            console.error("Error saving post to storage:", error);
        }
    },

    deletePost: (id: string): void => {
        try {
            const posts = storage.getPosts();
            const newPosts = posts.filter((p) => p.id !== id);
            localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(newPosts));
        } catch (error) {
            console.error("Error deleting post from storage:", error);
        }
    },

    toggleFavorite: (id: string): void => {
        try {
            const posts = storage.getPosts();
            const newPosts = posts.map((p) =>
                p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
            );
            localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(newPosts));
        } catch (error) {
            console.error("Error toggling favorite:", error);
        }
    },

    clearHistory: (): void => {
        try {
            localStorage.removeItem(STORAGE_KEYS.POSTS);
        } catch (error) {
            console.error("Error clearing history:", error);
        }
    },
};
