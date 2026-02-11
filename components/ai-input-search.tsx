"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, ChevronDown, Loader2, LayoutGrid, ArrowLeftRight, AlertCircle, Trophy, Boxes, Mountain, X, Edit3, Lightbulb, Pencil, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TONES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Template } from "@/types";

const TEMPLATES: Template[] = [
    {
        id: "contrast",
        name: "Contrast",
        description: "Myth vs. Reality",
        icon: "ArrowLeftRight"
    },
    {
        id: "mistake",
        name: "Mistake",
        description: "Lessons from failure",
        icon: "AlertCircle"
    },
    {
        id: "result",
        name: "Result",
        description: "Case study / Outcome",
        icon: "Trophy"
    },
    {
        id: "toolstack",
        name: "Tool Stack",
        description: "Curated resources",
        icon: "Boxes"
    },
    {
        id: "storyarc",
        name: "Story Arc",
        description: "Before & After",
        icon: "Mountain"
    }
];

const IconMap: Record<string, any> = {
    ArrowLeftRight,
    AlertCircle,
    Trophy,
    Boxes,
    Mountain
};

interface AIInputSearchProps {
    onGenerate: (topic: string, tone: string, length: "Short" | "Medium" | "Long", referencePost?: string, templateId?: string) => void;
    isGenerating: boolean;
    hasResults?: boolean;
}

export default function AI_Input_Search({
    onGenerate,
    isGenerating,
    hasResults = false,
}: AIInputSearchProps) {
    const [topic, setTopic] = useState("");
    const [selectedTone, setSelectedTone] = useState<typeof TONES[number]>(TONES[0]);
    const [activeMenu, setActiveMenu] = useState<"tone" | "length" | "templates" | null>(null);
    const [selectedLength, setSelectedLength] = useState<"Short" | "Medium" | "Long">("Medium");
    const [showBrandVoice, setShowBrandVoice] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>(undefined);
    const [referencePost, setReferencePost] = useState("");
    const [isSummaryView, setIsSummaryView] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Load reference post from storage
    useEffect(() => {
        const saved = localStorage.getItem("postcraft_reference_post");
        if (saved) setReferencePost(saved);
    }, []);

    // Effect to switch to summary view when results come in
    useEffect(() => {
        if (hasResults && !isGenerating) {
            setIsSummaryView(true);
        } else if (!hasResults) {
            setIsSummaryView(false);
        }
    }, [hasResults, isGenerating]);

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

    const handleBrandVoiceChange = (text: string) => {
        setReferencePost(text);
        localStorage.setItem("postcraft_reference_post", text);
    };

    const handleSubmit = () => {
        if (!topic.trim() || isGenerating) return;
        onGenerate(topic, selectedTone.value, selectedLength, referencePost, selectedTemplate);
    };

    if (isSummaryView && topic) {
        return (
            <motion.div
                layoutId="input-container"
                className="w-full max-w-2xl mx-auto relative z-20"
            >
                <div className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white rounded-[2rem] p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div className="relative z-10">
                        <h2 className="text-xl font-medium text-neutral-800 dark:text-neutral-200 mb-6 truncate pr-12">
                            {topic}
                        </h2>

                        <div className="flex flex-wrap gap-3 mb-6">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/50 text-xs font-medium text-neutral-600 dark:text-neutral-300">
                                <span className="text-base">{selectedTone.emoji}</span>
                                {selectedTone.label}
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/50 text-xs font-medium text-neutral-600 dark:text-neutral-300">
                                <Pencil className="w-3.5 h-3.5" />
                                {selectedLength}
                            </div>
                            {showBrandVoice && (
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-600 dark:text-blue-400">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Brand Voice
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setIsSummaryView(false)}
                            className="w-full h-12 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-lg shadow-black/5 dark:shadow-white/5"
                        >
                            <Sparkles className="w-4 h-4" />
                            New Generation
                        </button>
                    </div>

                    <div className="absolute top-4 right-4">
                        <button
                            onClick={() => setIsSummaryView(false)}
                            className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                        >
                            <Edit3 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div layoutId="input-container" className="w-full max-w-2xl mx-auto relative group z-20 space-y-3">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-3xl opacity-10 group-hover:opacity-20 blur-2xl transition-opacity duration-700 animate-gradient-xy pointer-events-none" />

            <div
                className={cn(
                    "relative bg-white/70 dark:bg-neutral-900/70 backdrop-blur-2xl border border-neutral-200/50 dark:border-neutral-800/50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-500 group-hover:border-neutral-300 dark:group-hover:border-neutral-700 overflow-hidden",
                    activeMenu ? "z-30" : "z-10"
                )}
            >
                <div className="flex flex-col">
                    <textarea
                        ref={textareaRef}
                        value={topic}
                        onChange={(e) => {
                            setTopic(e.target.value);
                            adjustHeight();
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="What do you want to post about? (e.g. 'my new 3D animation project')"
                        className="w-full bg-transparent border-none text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:ring-0 focus:outline-none resize-none text-lg px-6 pt-6 pb-2 min-h-[100px] font-light leading-relaxed"
                        disabled={isGenerating}
                        rows={1}
                    />

                    {/* Template Gallery */}
                    <AnimatePresence>
                        {activeMenu === "templates" && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden border-t border-neutral-200/30 dark:border-neutral-800/30 bg-neutral-50/50 dark:bg-black/20"
                            >
                                <div
                                    ref={scrollContainerRef}
                                    className="flex items-center gap-3 p-5 overflow-x-auto no-scrollbar mask-fade-right"
                                >
                                    {TEMPLATES.map((template) => {
                                        const Icon = IconMap[template.icon];
                                        const isSelected = selectedTemplate === template.id;

                                        return (
                                            <button
                                                key={template.id}
                                                onClick={() => setSelectedTemplate(isSelected ? undefined : template.id)}
                                                className={cn(
                                                    "flex-shrink-0 flex flex-col items-start p-4 w-44 rounded-[2rem] border transition-all duration-500 relative overflow-hidden group/card",
                                                    isSelected
                                                        ? "bg-blue-600 border-blue-500 text-white shadow-2xl shadow-blue-500/30 -translate-y-1"
                                                        : "bg-white/50 dark:bg-neutral-800/40 border-neutral-200/50 dark:border-white/5 text-neutral-600 dark:text-neutral-400 hover:border-blue-500/30 hover:bg-white dark:hover:bg-neutral-800"
                                                )}
                                            >
                                                <div className={cn(
                                                    "p-2.5 rounded-2xl mb-3 transition-colors duration-500",
                                                    isSelected ? "bg-white/20" : "bg-neutral-100 dark:bg-white/5 group-hover/card:bg-blue-500/10"
                                                )}>
                                                    <Icon className={cn("w-5 h-5", !isSelected && "group-hover/card:text-blue-500")} />
                                                </div>
                                                <p className="text-sm font-bold leading-tight mb-1">{template.name}</p>
                                                <p className={cn(
                                                    "text-[10px] leading-relaxed",
                                                    isSelected ? "text-white/70" : "text-neutral-400"
                                                )}>{template.description}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Control Bar */}
                    <div className="flex items-center justify-between px-3 pb-3 pt-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {/* Tone Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setActiveMenu(activeMenu === "tone" ? null : "tone")}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 border",
                                        activeMenu === "tone"
                                            ? "bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                                            : "text-neutral-500 dark:text-neutral-400 border-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-neutral-800 dark:hover:text-neutral-200"
                                    )}
                                >
                                    <span className="text-sm">{selectedTone.emoji}</span>
                                    <span className="hidden sm:inline">{selectedTone.label}</span>
                                    <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-300", activeMenu === "tone" && "rotate-180")} />
                                </button>
                                <AnimatePresence>
                                    {activeMenu === "tone" && (
                                        <>
                                            {/* Backdrop for mobile */}
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                onClick={() => setActiveMenu(null)}
                                                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[90] md:hidden"
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                                                animate={{
                                                    opacity: 1,
                                                    y: 0,
                                                    scale: 1,
                                                    transition: { type: "spring", damping: 20, stiffness: 300 }
                                                }}
                                                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                                className="fixed md:absolute bottom-0 md:bottom-full left-0 right-0 md:right-auto m-2 md:m-0 md:mb-3 w-auto md:w-48 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-3xl border border-neutral-200/50 dark:border-neutral-800/50 rounded-[2rem] md:rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] z-[100] p-2 md:p-1.5 ring-1 ring-black/5 dark:ring-white/5"
                                            >
                                                <div className="flex flex-col md:block">
                                                    <div className="h-1.5 w-12 bg-neutral-200 dark:bg-neutral-700 rounded-full mx-auto my-2 md:hidden" />
                                                    {TONES.map((tone) => (
                                                        <button
                                                            key={tone.value}
                                                            onClick={() => {
                                                                setSelectedTone(tone);
                                                                setActiveMenu(null);
                                                            }}
                                                            className={cn(
                                                                "w-full flex items-center gap-3 px-3 py-2.5 text-xs rounded-xl transition-all duration-200",
                                                                selectedTone.value === tone.value
                                                                    ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm font-semibold"
                                                                    : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-neutral-800 dark:hover:text-neutral-200"
                                                            )}
                                                        >
                                                            <span className="text-base">{tone.emoji}</span>
                                                            {tone.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Length Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setActiveMenu(activeMenu === "length" ? null : "length")}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 border",
                                        activeMenu === "length"
                                            ? "bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                                            : "text-neutral-500 dark:text-neutral-400 border-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-neutral-800 dark:hover:text-neutral-200"
                                    )}
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">{selectedLength}</span>
                                    <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-300", activeMenu === "length" && "rotate-180")} />
                                </button>
                                <AnimatePresence>
                                    {activeMenu === "length" && (
                                        <>
                                            {/* Backdrop for mobile */}
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                onClick={() => setActiveMenu(null)}
                                                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[90] md:hidden"
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                                                animate={{
                                                    opacity: 1,
                                                    y: 0,
                                                    scale: 1,
                                                    transition: { type: "spring", damping: 20, stiffness: 300 }
                                                }}
                                                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                                className="fixed md:absolute bottom-0 md:bottom-full left-0 right-0 md:right-auto m-2 md:m-0 md:mb-3 w-auto md:w-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-3xl border border-neutral-200/50 dark:border-neutral-800/50 rounded-[2rem] md:rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] z-[100] p-2 md:p-1.5 ring-1 ring-black/5 dark:ring-white/5"
                                            >
                                                <div className="flex flex-col md:block">
                                                    <div className="h-1.5 w-12 bg-neutral-200 dark:bg-neutral-700 rounded-full mx-auto my-2 md:hidden" />
                                                    {["Short", "Medium", "Long"].map((len) => (
                                                        <button
                                                            key={len}
                                                            onClick={() => {
                                                                setSelectedLength(len as "Short" | "Medium" | "Long");
                                                                setActiveMenu(null);
                                                            }}
                                                            className={cn(
                                                                "w-full flex items-center gap-3 px-3 py-2.5 text-xs rounded-xl transition-all duration-200",
                                                                selectedLength === len
                                                                    ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm font-semibold"
                                                                    : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-neutral-800 dark:hover:text-neutral-200"
                                                            )}
                                                        >
                                                            {len}
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Brand Voice Toggle */}
                            <button
                                onClick={() => {
                                    setShowBrandVoice(!showBrandVoice);
                                    if (!showBrandVoice) setActiveMenu(null);
                                }}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300 border",
                                    showBrandVoice
                                        ? "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                                        : "text-neutral-500 dark:text-neutral-400 border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200"
                                )}
                            >
                                <Sparkles className={cn("w-3.5 h-3.5", showBrandVoice && "fill-current animate-pulse text-blue-500")} />
                                <span className="hidden sm:inline">Brand Voice</span>
                                {referencePost && !showBrandVoice && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                )}
                            </button>

                            {/* Templates Toggle */}
                            <button
                                onClick={() => {
                                    setActiveMenu(activeMenu === "templates" ? null : "templates");
                                    setShowBrandVoice(false);
                                }}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300 border",
                                    activeMenu === "templates" || selectedTemplate
                                        ? "bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                                        : "text-neutral-500 dark:text-neutral-400 border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200"
                                )}
                            >
                                <LayoutGrid className={cn("w-3.5 h-3.5", (activeMenu === "templates" || selectedTemplate) && "fill-current text-purple-500")} />
                                <span className="hidden sm:inline">Templates</span>
                                {selectedTemplate && activeMenu !== "templates" && (
                                    <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                                        <span className="text-[10px] uppercase font-bold text-purple-500/70">{selectedTemplate}</span>
                                    </div>
                                )}
                            </button>
                        </div>

                        {/* Generate Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSubmit}
                            disabled={!topic.trim() || isGenerating}
                            className="bg-neutral-900 dark:bg-white text-white dark:text-black py-2.5 px-4 rounded-xl font-medium text-sm flex items-center gap-2 disabled:opacity-30 disabled:grayscale transition-all duration-300 shadow-lg"
                        >
                            {isGenerating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Sparkles className="w-4 h-4" />
                            )}
                            <span className="hidden sm:inline">Craft Post</span>
                        </motion.button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showBrandVoice && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="relative z-0"
                    >
                        <div className="bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-800/50 rounded-3xl p-5 shadow-xl transition-all duration-500">
                            <div className="flex justify-between items-center mb-3 px-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-3 bg-blue-500 rounded-full" />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Style Engine</span>
                                </div>
                                {referencePost && (
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                                        <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[9px] font-bold text-green-600 dark:text-green-400">ACTIVE</span>
                                    </div>
                                )}
                            </div>
                            <textarea
                                value={referencePost}
                                onChange={(e) => handleBrandVoiceChange(e.target.value)}
                                placeholder="Paste your best-performing post here. We'll extract your structure, emoji habits, and spacing 'DNA'..."
                                className="w-full bg-neutral-50/30 dark:bg-black/20 border border-neutral-200/50 dark:border-neutral-800/50 rounded-2xl p-4 text-sm text-neutral-600 dark:text-neutral-400 focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/30 outline-none resize-none transition-all placeholder:text-neutral-400/50 font-light min-h-[120px]"
                            />
                            <div className="mt-3 flex items-center gap-2 px-1">
                                <span className="text-[10px] text-neutral-400/80 leading-relaxed italic">
                                    PostCraft will prioritize this style over general AI defaults.
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
