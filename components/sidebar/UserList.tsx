
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {Avatar,AvatarFallback,AvatarImage,} from "@/components/ui/avatar";
import { Users, Loader2 } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import OnlineIndicator from "@/components/ui/OnlineIndicator";
import UnreadBadge from "@/components/ui/UnreadBadge";

// This component receives searchQuery from parent (Sidebar)
// and selectedUserId to highlight the active user
type UserListProps = {
  searchQuery: string;
  onUserClick: (userId: Id<"users">) => void;
  selectedUserId?: Id<"users"> | null;
};

export default function UserList({
  searchQuery,
  onUserClick,
  selectedUserId,
}: UserListProps) {
  // useQuery is like useEffect + fetch combined
  // It automatically re-runs when searchQuery changes
  // It also gives real-time updates when new users sign up!
  const users = useQuery(api.users.getAllUsers, { searchQuery });

  // Get presence for ALL users at once
  // This is a real-time subscription!
  const presenceMap = useQuery(api.presence.getAllPresence);

  // Show loading state while Convex fetches data
  // useQuery returns undefined while loading
  // Loading state
  if (users === undefined) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Empty state - no users found
  if (users.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title={searchQuery ? "No users found" : "No users yet"}
        description={
          searchQuery
            ? `No results for "${searchQuery}"`
            : "When others sign up they'll appear here"
        }
      />
    );
  }

  return (
    <div className="flex flex-col">
      {users.map((user) => {
        // Get first letter of name for avatar fallback
        const fallback = user.name?.charAt(0).toUpperCase() || "U";
        // Check if this user is currently selected
        const isSelected = selectedUserId === user._id;
        // Look up this user's online status from presenceMap
        // || false means default to offline if not found
        const isOnline = presenceMap?.[user._id] || false;
       
         return (
          <UserListItem
            key={user._id}
            user={user}
            fallback={fallback}
            isSelected={isSelected}
            isOnline={isOnline}
            onUserClick={onUserClick}
          />
        );
      })}
    </div>
  );
}

     
// Separate component for each user item
// So each can independently fetch unread count

function UserListItem({
  user,
  fallback,
  isSelected,
  isOnline,
  onUserClick,
}: {
  user: { _id: Id<"users">; name: string; email: string; imageUrl?: string };
  fallback: string;
  isSelected: boolean;
  isOnline: boolean;
  onUserClick: (userId: Id<"users">) => void;
}) {
  // Fetch conversationId directly from Convex
  const conversationId = useQuery(
    api.conversations.getConversationByUser,
    { otherUserId: user._id }
  );

  // Get unread count only if conversation exists
  const unreadCount = useQuery(
    api.reads.getUnreadCount,
    conversationId ? { conversationId } : "skip"
  );

  return (
    <button
      onClick={() => onUserClick(user._id)}
      className={`
        flex items-center gap-3 p-3 w-full text-left
        hover:bg-muted/50 transition-colors
        ${isSelected ? "bg-muted" : ""}
      `}
    >
      {/* Avatar with online dot */}
      <div className="relative shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.imageUrl} alt={user.name} />
          <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>
        <div className="absolute bottom-0 right-0">
          <OnlineIndicator isOnline={isOnline} />
        </div>
      </div>

      {/* User info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{user.name}</p>
        <p className="text-xs text-muted-foreground truncate">
          {isOnline ? (
            <span className="text-green-500">Online</span>
          ) : (
            user.email
          )}
        </p>
      </div>

      {/* Unread badge */}
      {unreadCount ? <UnreadBadge count={unreadCount} /> : null}
    </button>
  );
}