"use client";

import { useState, useEffect } from "react";
import { SavedPost } from "@/types";
import { storage } from "@/lib/storage";
import { toast } from "sonner";

export function usePostHistory() {
    const [history, setHistory] = useState<SavedPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadHistory = () => {
        const posts = storage.getPosts();
        setHistory(posts);
        setIsLoading(false);
    };

    useEffect(() => {
        loadHistory();

        // Listen for updates from other components
        const handleUpdate = () => loadHistory();
        window.addEventListener("post-history-updated", handleUpdate);

        return () => {
            window.removeEventListener("post-history-updated", handleUpdate);
        };
    }, []);

    const savePost = (post: Omit<SavedPost, "id" | "createdAt" | "isFavorite">) => {
        const newPost: SavedPost = {
            ...post,
            id: crypto.randomUUID(),
            createdAt: Date.now(),
            isFavorite: false,
        };

        storage.savePost(newPost);
        // Dispatch event to notify other components
        window.dispatchEvent(new Event("post-history-updated"));
        toast.success("Post saved to history");
    };

    const deletePost = (id: string) => {
        storage.deletePost(id);
        window.dispatchEvent(new Event("post-history-updated"));
        toast.success("Post deleted");
    };

    const toggleFavorite = (id: string) => {
        storage.toggleFavorite(id);
        window.dispatchEvent(new Event("post-history-updated"));
    };

    const clearHistory = () => {
        storage.clearHistory();
        window.dispatchEvent(new Event("post-history-updated"));
        toast.success("History cleared");
    };

    return {
        history,
        isLoading,
        savePost,
        deletePost,
        toggleFavorite,
        clearHistory,
    };
}
