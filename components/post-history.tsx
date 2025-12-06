"use client";

import { useState } from "react";
import { usePostHistory } from "@/hooks/use-post-history";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { History, Trash2, Star, Copy } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { SavedPost } from "@/types";

export function PostHistory() {
    const { history, deletePost, toggleFavorite, clearHistory } = usePostHistory();
    const [isOpen, setIsOpen] = useState(false);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full text-neutral-900 dark:text-white">
                    <History className="h-5 w-5" />
                    <span className="sr-only">History</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md flex flex-col h-full">
                <SheetHeader className="flex-row items-center justify-between space-y-0 pb-4 border-b">
                    <SheetTitle>History</SheetTitle>
                    {history.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                if (confirm("Are you sure you want to clear all history?")) {
                                    clearHistory();
                                }
                            }}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                            Clear All
                        </Button>
                    )}
                </SheetHeader>

                <ScrollArea className="flex-1 -mx-6 px-6">
                    {history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center text-neutral-500">
                            <History className="h-12 w-12 mb-4 opacity-20" />
                            <p>No saved posts yet.</p>
                            <p className="text-sm">Generate some posts to see them here.</p>
                        </div>
                    ) : (
                        <div className="space-y-6 py-6">
                            {history.map((post) => (
                                <div
                                    key={post.id}
                                    className="group relative bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4 border border-neutral-200 dark:border-neutral-800 transition-all hover:border-neutral-300 dark:hover:border-neutral-700"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h4 className="font-medium text-sm line-clamp-1">
                                                {post.topic}
                                            </h4>
                                            <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
                                                <span className="capitalize bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                                                    {post.tone}
                                                </span>
                                                <span>
                                                    {formatDistanceToNow(post.createdAt, {
                                                        addSuffix: true,
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={`h-8 w-8 ${post.isFavorite
                                                ? "text-yellow-500 hover:text-yellow-600"
                                                : "text-neutral-400 hover:text-yellow-500"
                                                }`}
                                            onClick={() => toggleFavorite(post.id)}
                                        >
                                            <Star
                                                className={`h-4 w-4 ${post.isFavorite ? "fill-current" : ""
                                                    }`}
                                            />
                                        </Button>
                                    </div>

                                    <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-3 mb-3 font-sans">
                                        {post.hook}
                                    </p>

                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 px-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
                                            onClick={() => copyToClipboard(post.full)}
                                        >
                                            <Copy className="h-3.5 w-3.5 mr-1.5" />
                                            Copy
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 text-neutral-400 hover:text-red-500"
                                            onClick={() => deletePost(post.id)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
