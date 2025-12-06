import { useState, useRef } from "react";
import { motion } from "motion/react";
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
}

export default function PostDisplay({ posts, topic, tone }: PostDisplayProps) {
    const [viewMode, setViewMode] = useState<"text" | "preview">("text");
    const { savePost } = usePostHistory();
    const [savedIndices, setSavedIndices] = useState<number[]>([]);
    const [exportingIndex, setExportingIndex] = useState<number | null>(null);

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
        // Target the specific export preview element
        const element = document.getElementById(`export-preview-${index}`);

        if (!element) {
            toast.error("Could not find post to export");
            setExportingIndex(null);
            return;
        }

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: null,
                useCORS: true,
                logging: false,
                onclone: (clonedDoc) => {
                    // Ensure the cloned element is visible
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

    if (!posts || posts.length === 0) return null;

    return (
        <div className="w-full max-w-4xl mx-auto mt-8 space-y-6">
            <div className="flex justify-end gap-2">
                <Button
                    variant={viewMode === "text" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("text")}
                    className="gap-2"
                >
                    <FileText className="w-4 h-4" />
                    Text View
                </Button>
                <Button
                    variant={viewMode === "preview" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("preview")}
                    className="gap-2"
                >
                    <Eye className="w-4 h-4" />
                    LinkedIn Preview
                </Button>
            </div>

            {/* Hidden Export Container */}
            <div className="fixed left-[-9999px] top-[-9999px]">
                {posts.map((post, index) => (
                    <div
                        key={`export-${index}`}
                        id={`export-preview-${index}`}
                        className="w-[600px] p-8 bg-transparent flex items-center justify-center" // Add padding and flex centering
                    >
                        <LinkedInPreview
                            content={post.full}
                            hashtags={post.hashtags}
                            className="shadow-2xl" // Add a nice shadow for the export
                            forceExpanded={true}
                        />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="group bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col hover:border-neutral-300 dark:hover:border-neutral-700"
                    >
                        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center bg-neutral-50/50 dark:bg-neutral-800/30">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium border border-blue-500/20">
                                <Sparkles className="w-3 h-3" />
                                Option {index + 1}
                            </span>
                            <span className="text-xs font-medium text-neutral-400 font-mono">
                                {post.characterCount} chars
                            </span>
                        </div>

                        <div className="p-6 flex-grow">
                            {viewMode === "text" ? (
                                <div className="prose dark:prose-invert prose-sm max-w-none whitespace-pre-wrap font-sans text-neutral-800 dark:text-neutral-200 leading-relaxed">
                                    {/* Highlight the hook */}
                                    <span className="bg-yellow-100 dark:bg-yellow-500/20 text-neutral-900 dark:text-yellow-200 px-1 -mx-1 rounded font-medium">
                                        {post.hook}
                                    </span>
                                    {post.body}
                                    <br /><br />
                                    <span className="font-medium text-blue-600 dark:text-blue-400">
                                        {post.cta}
                                    </span>

                                    {/* Hashtags */}
                                    {post.hashtags && (
                                        <>
                                            <br /><br />
                                            <span className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
                                                {post.hashtags}
                                            </span>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <LinkedInPreview
                                    content={post.full}
                                    hashtags={post.hashtags}
                                />
                            )}
                        </div>

                        <div className="p-4 bg-neutral-50/50 dark:bg-neutral-800/30 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSave(post, index)}
                                    disabled={savedIndices.includes(index)}
                                    className={`gap-2 transition-colors ${savedIndices.includes(index) ? "text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20" : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"}`}
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
                                    className="gap-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
                                >
                                    {exportingIndex === index ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Download className="w-4 h-4" />
                                    )}
                                    Export
                                </Button>
                            </div>
                            <CopyButton text={post.full} />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
