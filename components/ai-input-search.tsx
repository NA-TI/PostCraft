"use client";

import { Globe, Paperclip, Send } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";

interface AIInputSearchProps {
    onGenerate: (topic: string, tone: string) => void;
    isGenerating: boolean;
}

export default function AI_Input_Search({ onGenerate, isGenerating }: AIInputSearchProps) {
    const [value, setValue] = useState("");
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 52,
        maxHeight: 200,
    });
    const [showSearch, setShowSearch] = useState(true); // Re-purposed for Tone selector maybe? Or keep as is for now.
    const [isFocused, setIsFocused] = useState(false);
    const [tone, setTone] = useState("Friendly"); // Default tone

    const handleSubmit = () => {
        if (!value.trim() || isGenerating) return;
        onGenerate(value, tone);
        // We don't clear value immediately so user can see what they typed, or maybe we do?
        // Let's keep it for now.
        // setValue(""); 
        adjustHeight(true);
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const handleContainerClick = () => {
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    };

    return (
        <div className="w-full py-4">
            <div className="relative max-w-xl w-full mx-auto">
                <div
                    role="textbox"
                    tabIndex={0}
                    aria-label="Search input container"
                    className={cn(
                        "relative flex flex-col rounded-xl transition-all duration-200 w-full text-left cursor-text",
                        "ring-1 ring-black/10 dark:ring-white/10",
                        isFocused && "ring-black/20 dark:ring-white/20"
                    )}
                    onClick={handleContainerClick}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            handleContainerClick();
                        }
                    }}
                >
                    <div className="overflow-y-auto max-h-[200px]">
                        <Textarea
                            id="ai-input-04"
                            value={value}
                            placeholder="What do you want to post about? (e.g. 'my new 3D animation project')"
                            className="w-full rounded-xl rounded-b-none px-4 py-3 bg-black/5 dark:bg-white/5 border-none dark:text-white placeholder:text-black/70 dark:placeholder:text-white/70 resize-none focus-visible:ring-0 leading-[1.2]"
                            ref={textareaRef}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                            }}
                            onChange={(e) => {
                                setValue(e.target.value);
                                adjustHeight();
                            }}
                        />
                    </div>

                    <div className="h-12 bg-black/5 dark:bg-white/5 rounded-b-xl">
                        <div className="absolute left-3 bottom-3 flex items-center gap-2">
                            {/* Tone Selector could go here instead of the globe/paperclip */}
                            <select
                                value={tone}
                                onChange={(e) => setTone(e.target.value)}
                                className="bg-transparent text-sm text-black/60 dark:text-white/60 focus:outline-none cursor-pointer"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <option value="Friendly">🙂 Friendly</option>
                                <option value="Smart">🧠 Smart</option>
                                <option value="Professional">💼 Professional</option>
                                <option value="Storytelling">📖 Storytelling</option>
                            </select>
                        </div>
                        <div className="absolute right-3 bottom-3">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={!value.trim() || isGenerating}
                                className={cn(
                                    "rounded-lg p-2 transition-colors",
                                    value.trim() && !isGenerating
                                        ? "bg-sky-500/15 text-sky-500"
                                        : "bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white cursor-pointer"
                                )}
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
