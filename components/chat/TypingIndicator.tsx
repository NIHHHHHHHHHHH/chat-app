"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

type TypingIndicatorProps = {
  conversationId: Id<"conversations">;
};

export default function TypingIndicator({ conversationId }: TypingIndicatorProps) {
  const typingData = useQuery(api.typing.getTypingUsers, { conversationId });

  if (!typingData || typingData.length === 0) return null;

  const names = typingData
    .map((t) => t.user?.name?.split(" ")[0] || "Someone")
    .join(", ");

  const label =
    typingData.length === 1
      ? `${names} is typing...`
      : `${names} are typing...`;

  return (
    <div className="flex items-center gap-2 px-4 py-1 h-6">
      {/* Animated dots */}
      <div className="flex gap-0.5 items-center">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
            style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}