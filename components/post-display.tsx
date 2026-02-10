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
        <div className="w-full max-w-4xl mx-auto mt-8 space-y-6">
            <div className="flex justify-between items-center bg-white/50 dark:bg-neutral-900/50 p-2 rounded-2xl border border-neutral-200 dark:border-neutral-800 backdrop-blur-sm">
                <div className="flex items-center gap-3 px-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Engine</p>
                        <p className="text-sm font-medium dark:text-neutral-200">{modelUsed?.split('/')[1] || "Default Engine"}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={viewMode === "text" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("text")}
                        className="gap-2 rounded-xl"
                    >
                        <FileText className="w-4 h-4" />
                        Text View
                    </Button>
                    <Button
                        variant={viewMode === "preview" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("preview")}
                        className="gap-2 rounded-xl"
                    >
                        <Eye className="w-4 h-4" />
                        LinkedIn Preview
                    </Button>
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
                        className="group bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500 overflow-hidden flex flex-col hover:border-blue-500/20"
                    >
                        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center bg-neutral-50/30 dark:bg-neutral-800/20">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-[10px] font-bold uppercase tracking-widest border border-neutral-200 dark:border-neutral-700">
                                Option {index + 1}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                    {post.full.length} chars
                                </span>
                            </div>
                        </div>

                        <div className="p-6 flex-grow overflow-hidden">
                            {viewMode === "text" ? (
                                <div className="space-y-4 h-full flex flex-col">
                                    <div className="relative group/edit">
                                        <textarea
                                            value={post.hook}
                                            onChange={(e) => handleEdit(index, "hook", e.target.value)}
                                            className={`w-full ${post.hook.length > 140
                                                ? "bg-red-50/50 dark:bg-red-500/5 focus:border-red-200 dark:focus:border-red-500/30 text-red-900 dark:text-red-100"
                                                : "bg-yellow-50/50 dark:bg-yellow-500/5 focus:border-yellow-200 dark:focus:border-yellow-500/30 text-neutral-900 dark:text-yellow-100"
                                                } p-3 rounded-xl font-medium text-sm border-2 border-transparent outline-none resize-none transition-all leading-relaxed`}
                                            rows={2}
                                            placeholder="Write your hook..."
                                        />
                                        <div className="absolute top-2 right-2 flex items-center gap-2">
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${post.hook.length > 140
                                                ? "bg-red-500/20 text-red-600 dark:text-red-400"
                                                : "bg-yellow-500/20 text-yellow-700 dark:text-yellow-500"
                                                }`}>
                                                {post.hook.length}/140
                                            </span>
                                            <button
                                                onClick={() => handleMagicHook(index)}
                                                disabled={loadingHooks[index]}
                                                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition-colors group/magic"
                                                title="Generate Magic Hooks"
                                            >
                                                {loadingHooks[index] ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                                                ) : (
                                                    <Sparkles className="w-3.5 h-3.5 text-blue-500/50 group-hover/magic:text-blue-500 transition-colors" />
                                                )}
                                            </button>
                                        </div>

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
                                            <div className="absolute -bottom-5 left-0 text-[10px] font-medium text-red-500 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                                                <span>⚠️ Likely cut off on mobile preview</span>
                                            </div>
                                        )}
                                    </div>

                                    <textarea
                                        value={post.body}
                                        onChange={(e) => handleEdit(index, "body", e.target.value)}
                                        className="w-full bg-transparent text-neutral-700 dark:text-neutral-300 p-3 rounded-xl text-sm border-2 border-transparent focus:border-neutral-100 dark:focus:border-neutral-800 outline-none resize-none transition-all flex-grow leading-relaxed font-sans"
                                        rows={8}
                                        placeholder="Write your body..."
                                    />

                                    <textarea
                                        value={post.cta}
                                        onChange={(e) => handleEdit(index, "cta", e.target.value)}
                                        className="w-full bg-blue-50/30 dark:bg-blue-500/5 text-blue-600 dark:text-blue-400 p-3 rounded-xl font-medium text-sm border-2 border-transparent focus:border-blue-100 dark:focus:border-blue-500/20 outline-none resize-none transition-all leading-relaxed"
                                        rows={2}
                                        placeholder="Add a call to action..."
                                    />

                                    <textarea
                                        value={post.hashtags}
                                        onChange={(e) => handleEdit(index, "hashtags", e.target.value)}
                                        className="w-full bg-transparent text-neutral-400 p-3 rounded-xl text-xs border-2 border-transparent focus:border-neutral-100 dark:focus:border-neutral-800 outline-none resize-none transition-all leading-relaxed"
                                        rows={1}
                                        placeholder="#hashtags"
                                    />
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
