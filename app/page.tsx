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
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentTopic, setCurrentTopic] = useState("");
  const [currentTone, setCurrentTone] = useState<Tone>("Professional");
  const [modelUsed, setModelUsed] = useState<string | null>(null);

  const handleGenerate = async (topic: string, tone: string, length: "Short" | "Medium" | "Long", referencePost?: string, templateId?: string) => {
    setIsGenerating(true);
    setError(null);
    setGeneratedPosts([]);
    setCurrentTopic(topic);
    setCurrentTone(tone as Tone);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, tone: tone as Tone, length, referencePost, templateId }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to generate posts");
      }

      setGeneratedPosts(data.posts);
      setModelUsed(data.modelUsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-black flex flex-col items-center justify-start pt-12 md:pt-20 px-4 relative overflow-hidden transition-all duration-700">
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
        {/* Header */}
        <div className={generatedPosts.length > 0 ? "relative text-center space-y-2 mb-8 transition-all duration-500" : "relative text-center space-y-4 mb-12 transition-all duration-500"}>
          <div className="flex justify-end items-center w-full mb-6 md:absolute md:top-0 md:mb-0">
            <div className="flex items-center gap-2">
              <PostHistory />
              <ThemeToggle />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="pt-0"
          >
            <h1 className={generatedPosts.length > 0 ? "text-4xl md:text-5xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-neutral-950 via-neutral-700 to-neutral-900 dark:from-white dark:via-neutral-400 dark:to-neutral-500 pb-2 transition-all duration-500" : "text-6xl md:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-neutral-950 via-neutral-700 to-neutral-900 dark:from-white dark:via-neutral-400 dark:to-neutral-500 pb-2 transition-all duration-500"}>
              PostCraft
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className={generatedPosts.length > 0 ? "hidden" : "text-lg md:text-xl text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto font-light px-4 leading-relaxed"}
          >
            Turn your ideas into polished LinkedIn posts in seconds.
          </motion.p>
        </div>

        {/* Input Section */}
        <AI_Input_Search
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          hasResults={generatedPosts.length > 0}
        />

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
          modelUsed={modelUsed}
        />

        {/* Generate More Button */}
        <AnimatePresence>
          {generatedPosts.length > 0 && !isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex justify-center pb-20"
            >
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  setGeneratedPosts([]);
                  setModelUsed(null);
                }}
                className="rounded-full px-8 gap-2 group"
              >
                <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                Generate More
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
