"use client";

import { motion } from "motion/react";
import CopyButton from "./copy-button";
import { GeneratedPost } from "@/types";

interface PostDisplayProps {
    posts: GeneratedPost[];
}

export default function PostDisplay({ posts }: PostDisplayProps) {
    if (!posts || posts.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto mt-8">
            {posts.map((post, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white dark:bg-neutral-900 rounded-xl border border-black/5 dark:border-white/5 shadow-sm overflow-hidden flex flex-col"
                >
                    <div className="p-6 flex-grow">
                        <div className="mb-4">
                            <span className="inline-block px-2 py-1 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-medium">
                                Option {index + 1}
                            </span>
                            <span className="ml-2 text-xs text-neutral-400">
                                {post.characterCount} chars
                            </span>
                        </div>

                        <div className="prose dark:prose-invert prose-sm max-w-none whitespace-pre-wrap font-sans text-neutral-800 dark:text-neutral-200 leading-relaxed">
                            {/* Highlight the hook */}
                            <span className="bg-yellow-100 dark:bg-yellow-900/30 px-1 -mx-1 rounded">
                                {post.hook}
                            </span>
                            {post.body}
                            <br /><br />
                            <span className="font-medium text-sky-600 dark:text-sky-400">
                                {post.cta}
                            </span>
                        </div>
                    </div>

                    <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 border-t border-black/5 dark:border-white/5 flex justify-end">
                        <CopyButton text={post.full} />
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
