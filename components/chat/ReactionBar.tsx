"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Smile } from "lucide-react";

const EMOJI_SET = ["👍", "❤️", "😂", "😮", "😢"];

type ReactionBarProps = {
  messageId: Id<"messages">;
  isCurrentUser: boolean;
  isDeleted?: boolean;
};

export default function ReactionBar({
  messageId,
  isCurrentUser,
  isDeleted,
}: ReactionBarProps) {
  const [showPicker, setShowPicker] = useState(false);
  const toggleReaction = useMutation(api.reactions.toggleReaction);
  const reactions = useQuery(api.reactions.getReactions, { messageId });

  if (isDeleted) return null;

  const handleReaction = async (emoji: string) => {
    setShowPicker(false);
    try {
      await toggleReaction({ messageId, emoji });
    } catch (error) {
      console.error("Failed to toggle reaction:", error);
    }
  };

  return (
    <div
      className={`flex items-center gap-1 flex-wrap mt-1 ${
        isCurrentUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* Existing reaction counts */}
      {reactions && reactions.length > 0 &&
        reactions.map((reaction) => (
          <button
            key={reaction.emoji}
            onClick={() => handleReaction(reaction.emoji)}
            className={`
              flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
              border transition-colors
              ${reaction.hasReacted
                ? "bg-primary/10 border-primary text-primary"
                : "bg-background border-border text-foreground hover:bg-muted"
              }
            `}
          >
            <span>{reaction.emoji}</span>
            <span className="font-medium">{reaction.count}</span>
          </button>
        ))
      }

      {/* Smile button with picker */}
      <div className="relative">
        {/* Smile button — only visible on group hover */}
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          title="Add reaction"
        >
          <Smile className="h-3.5 w-3.5" />
        </button>

        {/* Picker opens UPWARD using bottom-8 */}
        {showPicker && (
          <>
            {/* Click outside to close */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowPicker(false)}
            />
            <div
              className={`
                absolute z-20 top-8
                ${isCurrentUser ? "right-0" : "left-0"}
                bg-background border border-border
                rounded-xl shadow-lg p-2 flex gap-1
              `}
            >
              {EMOJI_SET.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="text-lg hover:scale-125 transition-transform p-1 rounded-lg hover:bg-muted"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
