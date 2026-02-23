
"use client";

import { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage,} from "@/components/ui/avatar";
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

  // This Convex mutation creates or finds a conversation
  const getOrCreateConversation = useMutation(
    api.conversations.getOrCreateConversation
  );

  const avatarFallback =
    user?.firstName?.charAt(0) ||
    user?.fullName?.charAt(0) ||
    "U";

  // When user clicks another user in the list
  const handleUserClick = async (userId: Id<"users">) => {
    setSelectedUserId(userId);
    try {
      // Get or create conversation with this user
      const convId = await getOrCreateConversation({
        otherUserId: userId,
      });
      // Tell parent (page.tsx) which conversation to show
      onConversationSelect(convId, userId);
    } catch (error) {
      console.error("Failed to open conversation:", error);
    }
  };

  return (
    <div className="w-full md:w-80  h-screen bg-background border-r flex flex-col shrink-0">

      {/*  TOP: Title + Search  */}
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold mb-3">Messages</h1>
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/*  MIDDLE: User List  */}
      <div className="flex-1 overflow-y-auto">
        <UserList
          searchQuery={searchQuery}
          onUserClick={handleUserClick}
          selectedUserId={selectedUserId}
        />
      </div>

      {/*  BOTTOM: Current User  */}
      <div className="p-4 border-t flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {user?.fullName || user?.firstName || "User"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {user?.emailAddresses[0]?.emailAddress}
          </p>
        </div>
        <button
          onClick={() => signOut()}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}