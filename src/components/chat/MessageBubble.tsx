"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface MessageBubbleProps {
  content: string;
  role: "user" | "assistant";
  senderName?: string;
}

export function MessageBubble({
  content,
  role,
  senderName,
}: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 max-w-[80%]",
        isUser ? "ml-auto flex-row-reverse" : ""
      )}
    >
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback
          className={cn(isUser ? "bg-primary text-white" : "bg-gray-200")}
        >
          {isUser ? senderName?.[0] || "U" : "AI"}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "rounded-lg px-4 py-2",
          isUser
            ? "bg-primary text-white"
            : "bg-gray-100 text-foreground"
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}
