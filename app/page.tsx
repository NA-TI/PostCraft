"use client";

import { useState } from "react";
import AI_Input_Search from "@/components/ai-input-search";
import AILoadingState from "@/components/ai-loading-state";
import PostDisplay from "@/components/post-display";
import { GeneratedPost, Tone } from "@/types";
import { motion, AnimatePresence } from "motion/react";

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (topic: string, tone: string) => {
    setIsGenerating(true);
    setError(null);
    setGeneratedPosts([]);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, tone: tone as Tone }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to generate posts");
      }

      setGeneratedPosts(data.posts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-black flex flex-col items-center justify-start pt-20 px-4">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white">
            PostCraft
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">
            Turn your ideas into polished LinkedIn posts in seconds.
          </p>
        </div>

        {/* Input Section */}
        <AI_Input_Search onGenerate={handleGenerate} isGenerating={isGenerating} />

        {/* Loading State */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <AILoadingState />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Results */}
        <PostDisplay posts={generatedPosts} />
      </div>
    </main>
  );
}
