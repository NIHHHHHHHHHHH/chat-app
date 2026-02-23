
"use client";

import { MessageSquare } from "lucide-react";

export default function ChatArea() {
  return (
    // Takes all remaining width after sidebar
    // flex items-center justify-center = center the content
    <div className="flex-1 flex items-center justify-center bg-muted/10">
      <div className="text-center">

        {/* Icon */}
        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />

        {/* Message */}
        <h2 className="text-xl font-semibold mb-2">
          Your Messages
        </h2>
        <p className="text-muted-foreground text-sm">
          Select a conversation or start a new one
        </p>

      </div>
    </div>
  );
}