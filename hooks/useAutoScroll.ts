
import { useRef, useState, useEffect } from "react";

export function useAutoScroll(dependency: unknown) {
  // Ref attached to the bottom of message list
  const bottomRef = useRef<HTMLDivElement>(null);

  // Ref attached to the scrollable container
  const scrollRef = useRef<HTMLDivElement>(null);

  // Whether to show "↓ New messages" button
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Whether user is near bottom of chat
  const isNearBottom = () => {
    const container = scrollRef.current;
    if (!container) return true;

    const threshold = 100; // pixels from bottom
    return (
      container.scrollHeight - container.scrollTop - container.clientHeight
      < threshold
    );
  };

  // Handle scroll events
  const handleScroll = () => {
    if (isNearBottom()) {
      // User scrolled back to bottom → hide button
      setShowScrollButton(false);
    }
  };

  // When new messages arrive (dependency changes)
  useEffect(() => {
    if (isNearBottom()) {
      // User is at bottom → auto scroll
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setShowScrollButton(false);
    } else {
      // User scrolled up → show button
      setShowScrollButton(true);
    }
  }, [dependency]);

  // Scroll to bottom when button is clicked
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollButton(false);
  };

  return {
    bottomRef,
    scrollRef,
    showScrollButton,
    handleScroll,
    scrollToBottom,
  };
}