"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageSquare, Repeat, Send, Globe, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface LinkedInPreviewProps {
    content: string;
    hashtags?: string;
    className?: string;
    forceExpanded?: boolean;
}

export function LinkedInPreview({ content, hashtags, className, forceExpanded = false }: LinkedInPreviewProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Simple logic to truncate text for preview
    const previewLength = 210;
    const shouldTruncate = !forceExpanded && content.length > previewLength;
    const displayContent = isExpanded || forceExpanded || !shouldTruncate ? content : content.slice(0, previewLength);

    return (
        <div className={cn("bg-white dark:bg-[#1b1f23] border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden font-sans", className)}>
            {/* Header */}
            <div className="p-3 flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-700 flex-shrink-0 overflow-hidden">
                    {/* Placeholder Avatar */}
                    <div className="w-full h-full flex items-center justify-center text-neutral-500 dark:text-neutral-400 font-bold text-lg">
                        U
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-sm text-neutral-900 dark:text-white truncate">
                                User Name
                            </h3>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                                LinkedIn Creator • Content Strategist
                            </p>
                            <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                                <span>1h • </span>
                                <Globe className="w-3 h-3" />
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500">
                            <MoreHorizontal className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 pb-2 text-sm text-neutral-900 dark:text-neutral-100 whitespace-pre-wrap leading-relaxed">
                {displayContent}
                {!isExpanded && shouldTruncate && (
                    <span className="text-neutral-500 dark:text-neutral-400">... </span>
                )}
                {shouldTruncate && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-neutral-500 dark:text-neutral-400 hover:underline hover:text-blue-600 dark:hover:text-blue-400 font-medium ml-1"
                    >
                        {isExpanded ? "see less" : "see more"}
                    </button>
                )}

                {hashtags && (
                    <div className="mt-4 text-blue-600 dark:text-blue-400 font-medium">
                        {hashtags}
                    </div>
                )}
            </div>

            {/* Engagement Stats */}
            <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                <div className="flex items-center gap-1">
                    <div className="flex -space-x-1">
                        <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center z-10 border border-white dark:border-[#1b1f23]">
                            <ThumbsUp className="w-2.5 h-2.5 text-blue-600 fill-blue-600" />
                        </div>
                    </div>
                    <span>84</span>
                </div>
                <div className="flex gap-2">
                    <span>12 comments</span>
                    <span>•</span>
                    <span>4 reposts</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="px-2 py-1 flex items-center justify-between">
                <ActionButton icon={ThumbsUp} label="Like" />
                <ActionButton icon={MessageSquare} label="Comment" />
                <ActionButton icon={Repeat} label="Repost" />
                <ActionButton icon={Send} label="Send" />
            </div>
        </div>
    );
}

function ActionButton({ icon: Icon, label }: { icon: any, label: string }) {
    return (
        <button className="flex items-center justify-center gap-2 px-3 py-3 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex-1 text-neutral-600 dark:text-neutral-400 font-semibold text-sm">
            <Icon className="w-5 h-5" />
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
}
