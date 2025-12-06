"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, ChevronDown, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TONES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface AIInputSearchProps {
    onGenerate: (topic: string, tone: string, length: "Short" | "Medium" | "Long") => void;
    isGenerating: boolean;
}

export default function AI_Input_Search({
    onGenerate,
    isGenerating,
}: AIInputSearchProps) {
    const [topic, setTopic] = useState("");
    const [selectedTone, setSelectedTone] = useState<typeof TONES[number]>(TONES[0]);
    const [showToneDropdown, setShowToneDropdown] = useState(false);
    const [selectedLength, setSelectedLength] = useState<"Short" | "Medium" | "Long">("Medium");
    const [showLengthDropdown, setShowLengthDropdown] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleSubmit = () => {
        if (!topic.trim() || isGenerating) return;
        onGenerate(topic, selectedTone.value, selectedLength);
    };

    return (
        <div className="w-full max-w-2xl mx-auto relative group z-20">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl opacity-20 group-hover:opacity-40 blur-xl transition-opacity duration-500 animate-gradient-xy" />

            <div className="relative bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl transition-all duration-300 group-hover:border-neutral-300 dark:group-hover:border-neutral-700">
                <div className="p-2">
                    <textarea
                        ref={textareaRef}
                        value={topic}
                        onChange={(e) => {
                            setTopic(e.target.value);
                            adjustHeight();
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="What do you want to post about? (e.g. 'my new 3D animation project')"
                        className="w-full bg-transparent border-none text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:ring-0 focus:outline-none resize-none text-lg p-4 min-h-[80px] font-light"
                        disabled={isGenerating}
                        rows={1}
                    />

                    <div className="flex items-center justify-between px-2 pb-2 mt-2">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <button
                                    onClick={() => setShowToneDropdown(!showToneDropdown)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
                                >
                                    <span>{selectedTone.emoji}</span>
                                    <span>{selectedTone.label}</span>
                                    <ChevronDown
                                        className={`w-3 h-3 transition-transform duration-200 ${showToneDropdown ? "rotate-180" : ""
                                            }`}
                                    />
                                </button>

                                <AnimatePresence>
                                    {showToneDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute top-full left-0 mt-2 w-48 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl overflow-hidden z-50 p-1"
                                        >
                                            {TONES.map((tone) => (
                                                <button
                                                    key={tone.value}
                                                    onClick={() => {
                                                        setSelectedTone(tone);
                                                        setShowToneDropdown(false);
                                                    }}
                                                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${selectedTone.value === tone.value
                                                        ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                                                        : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-neutral-200"
                                                        }`}
                                                >
                                                    <span className="text-base">{tone.emoji}</span>
                                                    {tone.label}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => setShowLengthDropdown(!showLengthDropdown)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
                                >
                                    <span>📏</span>
                                    <span>{selectedLength}</span>
                                    <ChevronDown
                                        className={`w-3 h-3 transition-transform duration-200 ${showLengthDropdown ? "rotate-180" : ""
                                            }`}
                                    />
                                </button>

                                <AnimatePresence>
                                    {showLengthDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute top-full left-0 mt-2 w-32 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl overflow-hidden z-50 p-1"
                                        >
                                            {["Short", "Medium", "Long"].map((len) => (
                                                <button
                                                    key={len}
                                                    onClick={() => {
                                                        setSelectedLength(len as "Short" | "Medium" | "Long");
                                                        setShowLengthDropdown(false);
                                                    }}
                                                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${selectedLength === len
                                                        ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                                                        : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-neutral-200"
                                                        }`}
                                                >
                                                    {len}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={!topic.trim() || isGenerating}
                            className="p-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-black disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                        >
                            {isGenerating ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Sparkles className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
