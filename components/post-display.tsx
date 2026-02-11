import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import CopyButton from "./copy-button";
import { GeneratedPost, Tone } from "@/types";
import { LinkedInPreview } from "./linkedin-preview";
import { Button } from "./ui/button";
import { FileText, Eye, Bookmark, Check, Sparkles, Download, Loader2 } from "lucide-react";
import { usePostHistory } from "@/hooks/use-post-history";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PostDisplayProps {
    posts: GeneratedPost[];
    topic: string;
    tone: Tone;
    modelUsed?: string | null;
}

export default function PostDisplay({ posts, topic, tone, modelUsed }: PostDisplayProps) {
    const [viewMode, setViewMode] = useState<"text" | "preview">("text");
    const { savePost } = usePostHistory();
    const [savedIndices, setSavedIndices] = useState<number[]>([]);
    const [exportingIndex, setExportingIndex] = useState<number | null>(null);
    const [editablePosts, setEditablePosts] = useState<GeneratedPost[]>([]);
    const [loadingHooks, setLoadingHooks] = useState<Record<number, boolean>>({});
    const [hookOptions, setHookOptions] = useState<Record<number, Array<{ style: string; content: string }>>>({});

    // Initialize editable posts when new posts arrive
    useState(() => {
        setEditablePosts(posts);
    });

    // Update editable posts when props change
    const prevPostsRef = useRef<GeneratedPost[]>([]);
    if (posts !== prevPostsRef.current) {
        setEditablePosts(posts);
        prevPostsRef.current = posts;
        setSavedIndices([]);
        setHookOptions({});
    }

    const handleEdit = (index: number, field: keyof GeneratedPost, value: string) => {
        setEditablePosts((prev) => {
            const next = [...prev];
            const updatedPost = { ...next[index], [field]: value };

            if (field === "full") {
                next[index] = updatedPost;
            } else {
                next[index] = updatedPost;
                const p = next[index];
                next[index].full = `${p.hook}\n\n${p.body}\n\n${p.cta}`;
            }
            return next;
        });
    };

    const handleMagicHook = async (index: number) => {
        const post = editablePosts[index];
        setLoadingHooks(prev => ({ ...prev, [index]: true }));
        try {
            const response = await fetch("/api/generate/hook", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ body: post.body, tone }),
            });

            const data = await response.json();
            if (data.success) {
                setHookOptions(prev => ({ ...prev, [index]: data.hooks }));
                toast.success("Generated 3 new hook styles!");
            } else {
                throw new Error(data.error || "Failed to generate hooks");
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Magic Hook failed");
        } finally {
            setLoadingHooks(prev => ({ ...prev, [index]: false }));
        }
    };

    const selectHook = (index: number, content: string) => {
        handleEdit(index, "hook", content);
        setHookOptions(prev => {
            const next = { ...prev };
            delete next[index];
            return next;
        });
    };

    const handleSave = (post: GeneratedPost, index: number) => {
        savePost({
            ...post,
            topic,
            tone,
        });
        setSavedIndices((prev) => [...prev, index]);
    };
    const handleExportImage = async (index: number) => {
        setExportingIndex(index);
        const element = document.getElementById(`export-preview-${index}`);

        if (!element) {
            toast.error("Could not find post to export");
            setExportingIndex(null);
            return;
        }

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: "#ffffff",
                useCORS: true,
                logging: false,
                onclone: (clonedDoc) => {
                    const clonedElement = clonedDoc.getElementById(`export-preview-${index}`);
                    if (clonedElement) {
                        clonedElement.style.display = "block";
                        clonedElement.style.position = "static";
                        clonedElement.style.visibility = "visible";
                    }
                }
            });

            const image = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = image;
            link.download = `postcraft-${topic.slice(0, 20).replace(/\s+/g, "-")}-${index + 1}.png`;
            link.click();
            toast.success("Post exported as image");
        } catch (error) {
            console.error("Export failed:", error);
            toast.error("Failed to export image");
        } finally {
            setExportingIndex(null);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto mt-12 space-y-8">
            {/* Results Header Control Bar */}
            <div className="sticky top-4 z-30 flex justify-center items-center bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl p-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 shadow-xl mb-8 mx-2 sm:mx-0">
                <div className="flex bg-neutral-100/50 dark:bg-neutral-800/50 p-1 rounded-full border border-neutral-200 dark:border-neutral-700/50 w-full sm:w-auto">
                    <button
                        onClick={() => setViewMode("text")}
                        className={cn(
                            "flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all duration-300",
                            viewMode === "text"
                                ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
                        )}
                    >
                        <FileText className="w-3.5 h-3.5" />
                        Text View
                    </button>
                    <button
                        onClick={() => setViewMode("preview")}
                        className={cn(
                            "flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all duration-300",
                            viewMode === "preview"
                                ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
                        )}
                    >
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                    </button>
                </div>
            </div>

            {/* Hidden Export Container (Uses actual editable content) */}
            <div className="fixed left-[-9999px] top-[-9999px]">
                {editablePosts.map((post, index) => (
                    <div
                        key={`export-${index}`}
                        id={`export-preview-${index}`}
                        className="w-[600px] p-8 bg-white flex items-center justify-center"
                    >
                        <LinkedInPreview
                            content={post.full}
                            hashtags={post.hashtags}
                            className="shadow-2xl border border-neutral-200 rounded-xl"
                            forceExpanded={true}
                        />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                {editablePosts.map((post, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="group bg-white dark:bg-neutral-900 rounded-[2rem] border border-neutral-200 dark:border-neutral-800 shadow-xl dark:shadow-2xl overflow-hidden flex flex-col transition-all duration-500"
                    >
                        <div className="p-3 border-b border-neutral-100 dark:border-white/5 flex justify-between items-center bg-neutral-50/50 dark:bg-white/5">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-white/10 text-neutral-600 dark:text-neutral-300 text-[10px] font-bold uppercase tracking-widest border border-neutral-200 dark:border-white/5">
                                Option {index + 1}
                            </span>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
                                    {post.full.length} chars
                                </span>
                            </div>
                        </div>

                        <div className="p-6 flex-grow overflow-hidden">
                            {viewMode === "text" ? (
                                <div className="space-y-4 h-full flex flex-col">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-3 bg-yellow-500/50 rounded-full" />
                                            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-[0.2em]">The Hook</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={cn(
                                                "text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors",
                                                post.hook.length > 140
                                                    ? "bg-red-500/10 text-red-600 dark:text-red-400"
                                                    : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-500"
                                            )}>
                                                {post.hook.length} / 140
                                            </span>
                                            <button
                                                onClick={() => handleMagicHook(index)}
                                                disabled={loadingHooks[index]}
                                                className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all group/magic"
                                                title="Generate Magic Hooks"
                                            >
                                                {loadingHooks[index] ? (
                                                    <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                                                ) : (
                                                    <Sparkles className="w-3 h-3 text-blue-500/50 group-hover/magic:text-blue-500 transition-colors" />
                                                )}
                                                <span className="text-[9px] font-bold text-blue-500/50 group-hover/magic:text-blue-500 uppercase tracking-wider">Magic</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="relative group/edit">
                                        <textarea
                                            value={post.hook}
                                            onChange={(e) => handleEdit(index, "hook", e.target.value)}
                                            className={cn(
                                                "w-full p-4 rounded-2xl font-medium text-sm border transition-all leading-relaxed resize-none outline-none",
                                                post.hook.length > 140
                                                    ? "bg-red-50/30 dark:bg-red-500/5 border-red-100 dark:border-red-500/20 text-red-900 dark:text-red-100 focus:border-red-200"
                                                    : "bg-yellow-50/30 dark:bg-yellow-500/5 border-yellow-100 dark:border-yellow-500/20 text-neutral-900 dark:text-yellow-100 focus:border-yellow-200"
                                            )}
                                            rows={3}
                                            placeholder="Write your hook..."
                                        />

                                        <AnimatePresence>
                                            {hookOptions[index] && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    className="absolute top-10 right-0 w-72 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl z-50 p-3 space-y-2"
                                                >
                                                    <div className="flex justify-between items-center px-1 mb-2">
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Choose a style</span>
                                                        <button
                                                            onClick={() => setHookOptions(prev => {
                                                                const next = { ...prev };
                                                                delete next[index];
                                                                return next;
                                                            })}
                                                            className="text-[10px] font-bold text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                                                        >
                                                            Close
                                                        </button>
                                                    </div>
                                                    {hookOptions[index].map((opt, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => selectHook(index, opt.content)}
                                                            className="w-full text-left p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-transparent hover:border-blue-500/30 hover:bg-blue-50/30 dark:hover:bg-blue-500/5 transition-all group/item"
                                                        >
                                                            <div className="text-[10px] font-bold text-blue-500 uppercase tracking-tight mb-1">{opt.style}</div>
                                                            <div className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2 leading-snug group-hover/item:text-neutral-900 dark:group-hover/item:text-neutral-100">
                                                                {opt.content}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {post.hook.length > 140 && (
                                            <div className="mt-2 text-[9px] font-bold text-red-500 flex items-center gap-1.5 uppercase tracking-tighter animate-in fade-in slide-in-from-top-1 px-1">
                                                <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                                                <span>Likely cut off on mobile preview</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-6">
                                        <div className="flex items-center gap-2 mb-2 px-1">
                                            <div className="w-1 h-3 bg-neutral-300 dark:bg-neutral-700 rounded-full" />
                                            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-[0.2em]">The Insight</span>
                                        </div>
                                        <textarea
                                            value={post.body}
                                            onChange={(e) => handleEdit(index, "body", e.target.value)}
                                            className="w-full bg-neutral-50/50 dark:bg-white/5 border border-transparent focus:border-neutral-200 dark:focus:border-neutral-800 text-neutral-700 dark:text-neutral-300 p-4 rounded-2xl text-sm outline-none resize-none transition-all flex-grow leading-relaxed font-sans"
                                            rows={8}
                                            placeholder="Write your body..."
                                        />
                                    </div>

                                    <div className="mt-6">
                                        <div className="flex items-center gap-2 mb-2 px-1">
                                            <div className="w-1 h-3 bg-blue-500/50 rounded-full" />
                                            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-[0.2em]">The Close</span>
                                        </div>
                                        <textarea
                                            value={post.cta}
                                            onChange={(e) => handleEdit(index, "cta", e.target.value)}
                                            className="w-full bg-blue-50/50 dark:bg-blue-500/5 text-blue-600 dark:text-blue-400 p-4 rounded-2xl font-medium text-sm border border-blue-100/50 dark:border-blue-500/10 focus:border-blue-200 dark:focus:border-blue-500/20 outline-none resize-none transition-all leading-relaxed"
                                            rows={2}
                                            placeholder="Add a call to action..."
                                        />
                                    </div>

                                    <div className="mt-4">
                                        <textarea
                                            value={post.hashtags}
                                            onChange={(e) => handleEdit(index, "hashtags", e.target.value)}
                                            className="w-full bg-transparent text-neutral-400 p-3 rounded-xl text-[10px] font-medium border-none focus:ring-0 outline-none resize-none transition-all leading-relaxed italic"
                                            rows={1}
                                            placeholder="#hashtags"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <LinkedInPreview
                                    content={post.full}
                                    hashtags={post.hashtags}
                                />
                            )}
                        </div>

                        <div className="p-4 bg-neutral-50/30 dark:bg-neutral-800/20 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center gap-2">
                            <div className="flex gap-1.5">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSave(post, index)}
                                    disabled={savedIndices.includes(index)}
                                    className={`h-9 px-3 rounded-xl gap-2 transition-all ${savedIndices.includes(index) ? "bg-green-500/10 text-green-600 border border-green-500/20" : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
                                >
                                    {savedIndices.includes(index) ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Saved
                                        </>
                                    ) : (
                                        <>
                                            <Bookmark className="w-4 h-4" />
                                            Save
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleExportImage(index)}
                                    disabled={exportingIndex === index}
                                    className="h-9 px-3 rounded-xl gap-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                >
                                    {exportingIndex === index ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Download className="w-4 h-4" />
                                    )}
                                    Export
                                </Button>
                            </div>
                            <CopyButton text={post.full} className="h-9 rounded-xl" />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
