
"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

type MessageInputProps = {
  conversationId: Id<"conversations">;
};

export default function MessageInput({
  conversationId,
}: MessageInputProps) {
  // Track what user is typing
  const [message, setMessage] = useState("");

  // Track if message is being sent (prevents double sending)
  const [isSending, setIsSending] = useState(false);

  const sendMessage = useMutation(api.messages.sendMessage);

  const handleSend = async () => {
    // Don't send if empty or already sending
    if (!message.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendMessage({
        conversationId,
        content: message,
      });
      // Clear input after sending
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Send message when Enter key is pressed
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      // preventDefault stops new line being added
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t flex items-center gap-2">
      <Input
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isSending}
        className="flex-1"
      />
      <Button
        onClick={handleSend}
        disabled={!message.trim() || isSending}
        size="icon"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}