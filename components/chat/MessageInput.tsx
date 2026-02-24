"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

type MessageInputProps = {
  conversationId: Id<"conversations">;
};

export default function MessageInput({ conversationId }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const sendMessage = useMutation(api.messages.sendMessage);
  const updateTyping = useMutation(api.typing.updateTyping);

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up: stop typing indicator if user navigates away mid-type
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      updateTyping({ conversationId, isTyping: false });
    };
  }, [conversationId]);

  const stopTyping = () => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    updateTyping({ conversationId, isTyping: false });
  };

  const handleSend = async () => {
    if (!message.trim() || isSending) return;
    setIsSending(true);
    stopTyping();

    try {
      await sendMessage({ conversationId, content: message });
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    updateTyping({ conversationId, isTyping: true });

    // Reset the stop-typing timer on every keystroke
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      updateTyping({ conversationId, isTyping: false });
    }, 1000);
  };
  
  return (
  <div className="px-4 py-3 bg-background border-t border-border flex items-center gap-2">
    <Input
      placeholder="Write a message..."
      value={message}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      disabled={isSending}
      className="flex-1 rounded-full bg-muted/50 border-transparent px-4 focus-visible:ring-primary text-sm"
    />
    <button
      onClick={handleSend}
      disabled={!message.trim() || isSending}
      className="bg-priamry h-9 w-9 rounded-full flex items-center justify-center text-primary-foreground transition-opacity disabled:opacity-40 shrink-0"
    >
      <Send className="h-4 w-4" />
    </button>
  </div>
);
}