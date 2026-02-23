
"use client";

import { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import SearchBar from "./SearchBar";
import UserList from "./UserList";

export default function Sidebar() {
  const { user } = useUser();
  const { signOut } = useClerk();

  // searchQuery state - updates as user types
  // useState("") means it starts as empty string
  const [searchQuery, setSearchQuery] = useState("");

  // Track which user is currently selected
  const [selectedUserId, setSelectedUserId] =
    useState<Id<"users"> | null>(null);

  const avatarFallback =
    user?.firstName?.charAt(0) ||
    user?.fullName?.charAt(0) ||
    "U";

  // This function runs when a user is clicked
  const handleUserClick = (userId: Id<"users">) => {
    setSelectedUserId(userId);
    // we will open conversation here
    console.log("User clicked:", userId);
  };

  return (
    <div className="w-80 h-screen bg-background border-r flex flex-col">

      {/* TOP: App Title */}
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold mb-3">Messages</h1>

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      {/* MIDDLE: User List */}
      {/* flex-1 = takes all remaining space */}
      {/* overflow-y-auto = scrollable when many users */}
      <div className="flex-1 overflow-y-auto">
        <UserList
          searchQuery={searchQuery}
          onUserClick={handleUserClick}
          selectedUserId={selectedUserId}
        />
      </div>

      {/*  BOTTOM: Current User Profile  */}
      <div className="p-4 border-t flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage
            src={user?.imageUrl}
            alt={user?.fullName || "User"}
          />
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