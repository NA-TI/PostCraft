"use client";

import { useState } from "react";
import AI_Input_Search from "@/components/ai-input-search";
import AILoadingState from "@/components/ai-loading-state";
import PostDisplay from "@/components/post-display";
import { GeneratedPost, Tone } from "@/types";
import { motion, AnimatePresence } from "motion/react";
import { ThemeToggle } from "@/components/theme-toggle";
import { PostHistory } from "@/components/post-history";
import { GridPattern } from "@/components/ui/grid-pattern";

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentTopic, setCurrentTopic] = useState("");
  const [currentTone, setCurrentTone] = useState<Tone>("Professional");

  const handleGenerate = async (topic: string, tone: string, length: "Short" | "Medium" | "Long") => {
    setIsGenerating(true);
    setError(null);
    setGeneratedPosts([]);
    setCurrentTopic(topic);
    setCurrentTone(tone as Tone);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, tone: tone as Tone, length }),
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
    <main className="min-h-screen bg-neutral-50 dark:bg-black flex flex-col items-center justify-start pt-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-neutral-50 dark:to-black z-10" />
        <GridPattern
          width={50}
          height={50}
          x={-1}
          y={-1}
          className="stroke-neutral-200 dark:stroke-neutral-800/50 [mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)]"
        />
      </div>

      <div className="w-full max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="relative text-center space-y-4 mb-12">
          <div className="absolute right-0 top-0 flex items-center gap-2">
            <PostHistory />
            <ThemeToggle />
          </div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 via-neutral-600 to-neutral-900 dark:from-white dark:via-neutral-400 dark:to-white pb-2">
              PostCraft
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto font-light"
          >
            Turn your ideas into polished LinkedIn posts in seconds.
          </motion.p>
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
        <PostDisplay
          posts={generatedPosts}
          topic={currentTopic}
          tone={currentTone}
        />
      </div>
    </main>
  );
}
