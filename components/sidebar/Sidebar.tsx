// components/sidebar/Sidebar.tsx
"use client";

import { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { LogOut, MessageCircle } from "lucide-react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import SearchBar from "./SearchBar";
import UserList from "./UserList";

type SidebarProps = {
  onConversationSelect: (
    conversationId: Id<"conversations">,
    userId: Id<"users">
  ) => void;
  selectedConversationId: Id<"conversations"> | null;
};

export default function Sidebar({
  onConversationSelect,
  selectedConversationId,
}: SidebarProps) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] =
    useState<Id<"users"> | null>(null);

  const getOrCreateConversation = useMutation(
    api.conversations.getOrCreateConversation
  );

  // Mark conversation as read when opened
  const markRead = useMutation(api.reads.markConversationRead);

  const avatarFallback =
    user?.firstName?.charAt(0) ||
    user?.fullName?.charAt(0) ||
    "U";

  const handleUserClick = async (userId: Id<"users">) => {
    setSelectedUserId(userId);
    try {
      const convId = await getOrCreateConversation({
        otherUserId: userId,
      });

      // Mark as read immediately when opened
      await markRead({ conversationId: convId });

      onConversationSelect(convId, userId);
    } catch (error) {
      console.error("Failed to open conversation:", error);
    }
  };

  return (
    <div className="w-full md:w-80 h-screen bg-background border-r border-border flex flex-col shrink-0 shadow-sm">

      {/* TOP — App title + search */}
      <div className="px-4 pt-5 pb-3 border-b border-border bg-background">
        {/* App branding */}
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-primary h-8 w-8 rounded-full flex items-center justify-center">
            <MessageCircle className="h-4 w-4 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-bold tracking-tight">Messages</h1>
        </div>
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* MIDDLE — User list */}
      <div className="flex-1 overflow-y-auto bg-background">
        <UserList
          searchQuery={searchQuery}
          onUserClick={handleUserClick}
          selectedUserId={selectedUserId}
        />
      </div>

      {/* BOTTOM — Current user profile */}
      <div className="px-4 py-3 border-t border-border bg-background flex items-center gap-3">
        <Avatar className="h-9 w-9 ring-2 ring-primary/20">
          <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">
            {user?.fullName || user?.firstName || "User"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {user?.emailAddresses[0]?.emailAddress}
          </p>
        </div>

        <button
          onClick={() => signOut()}
          className="p-2 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}