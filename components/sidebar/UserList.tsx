
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Users } from "lucide-react";

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

  // Show loading state while Convex fetches data
  // useQuery returns undefined while loading
  if (users === undefined) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Show empty state when no users found
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4">
        <Users className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground text-center">
          {searchQuery
            ? `No users found for "${searchQuery}"`
            : "No other users yet"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {users.map((user) => {
        // Get first letter of name for avatar fallback
        const fallback = user.name?.charAt(0).toUpperCase() || "U";

        // Check if this user is currently selected
        const isSelected = selectedUserId === user._id;

        return (
          <button
            key={user._id}
            onClick={() => onUserClick(user._id)}
            className={`
              flex items-center gap-3 p-3 w-full text-left
              hover:bg-muted/50 transition-colors
              ${isSelected ? "bg-muted" : ""}
            `}
          >
            {/* User Avatar */}
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage src={user.imageUrl} alt={user.name} />
              <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              {/* truncate stops long names from breaking layout */}
              <p className="text-sm font-medium truncate">
                {user.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}