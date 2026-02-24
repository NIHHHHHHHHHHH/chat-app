
"use client";

import { useMutation } from "convex/react";
import { useEffect } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { MessageSquare, ArrowLeft } from "lucide-react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import EmptyState from "@/components/ui/EmptyState";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import OnlineIndicator from "@/components/ui/OnlineIndicator";


type ChatAreaProps = {
  conversationId: Id<"conversations"> | null;
  otherUserId?: Id<"users"> | null;
  // onBack is called when back button is clicked on mobile
  onBack: () => void;
};

export default function ChatArea({
  conversationId,
  otherUserId,
  onBack,
}: ChatAreaProps) {

  const otherUser = useQuery(
    api.users.getUserById,
    otherUserId ? { userId: otherUserId } : "skip"
  );

  const otherUserPresence = useQuery(
  api.presence.getUserPresence,
  otherUserId ? { userId: otherUserId } : "skip"
  );
  
  const markRead = useMutation(api.reads.markConversationRead);

  // Mark as read when conversation opens or new messages arrive
useEffect(() => {
  if (conversationId) {
    markRead({ conversationId });
  }
}, [conversationId, markRead]);

  // No conversation selected - only visible on desktop
  // because on mobile we show sidebar instead
  if (!conversationId) {
    return (
      <div className="flex-1 h-full items-center justify-center bg-muted/10 hidden md:flex">
        <EmptyState
          icon={MessageSquare}
          title="Your Messages"
          description="Select a user from the sidebar to start chatting"
        />
      </div>
    );
  }

  const fallback = otherUser?.name?.charAt(0).toUpperCase() || "U";

  return (
    <div className="flex-1 flex flex-col h-full">

     {/* HEADER */}
      <div className="px-4 py-3 border-b border-border bg-background flex items-center gap-3 shadow-sm">
      
        {/* Back button mobile */}
        <button
          onClick={onBack}
          className="md:hidden p-1.5 rounded-full text-muted-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      
        {/* Avatar with online dot */}
        <div className="relative">
          <Avatar className="h-9 w-9">
            <AvatarImage src={otherUser?.imageUrl} alt={otherUser?.name || "User"} />
            <AvatarFallback
              className="bg-primary text-primary-foreground text-sm font-semibold"
            >
              {fallback}
            </AvatarFallback>
          </Avatar>
          <div className="absolute bottom-0 right-0">
            <OnlineIndicator isOnline={otherUserPresence ?? false} size="sm" />
          </div>
        </div>
      
        {/* Name + status */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">
            {otherUser?.name || "Loading..."}
          </p>
          <p className="text-xs">
            {otherUserPresence ? (
              <span className="text-green-500 font-medium">Online</span>
            ) : (
              <span className="text-muted-foreground">Offline</span>
            )}
          </p>
        </div>
      
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <MessageList conversationId={conversationId} />
      </div>

      {/* INPUT */}
      <MessageInput conversationId={conversationId} />

    </div>
  );
}
