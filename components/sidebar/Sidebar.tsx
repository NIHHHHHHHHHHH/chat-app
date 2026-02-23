
"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

export default function Sidebar() {
  // Get logged in user info from Clerk
  const { user } = useUser();

  // useClerk gives us the signOut function
  const { signOut } = useClerk();

  // Get the first letter of user's name for avatar fallback
  // If name is "John Doe" → fallback is "J"
  const avatarFallback =
    user?.firstName?.charAt(0) ||
    user?.fullName?.charAt(0) ||
    user?.emailAddresses[0]?.emailAddress?.charAt(0) ||
    "U";

  return (
    // Sidebar container
    // h-screen = full height, flex-col = stack items vertically
    // border-r = right border to separate from chat area
    <div className="w-80 h-screen bg-background border-r flex flex-col">

      {/* ── TOP SECTION: App title ── */}
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">Messages</h1>
      </div>

      {/* ── MIDDLE SECTION: Conversations list ── */}
      {/* flex-1 means this section takes all remaining space */}
      <div className="flex-1 overflow-y-auto">
        {/* We will add conversation list here in Phase 6 */}
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-muted-foreground">
            No conversations yet
          </p>
        </div>
      </div>

      {/* ── BOTTOM SECTION: Current user profile ── */}
      {/* mt-auto pushes this to the bottom */}
      <div className="p-4 border-t flex items-center gap-3">

        {/* User Avatar */}
        <Avatar className="h-9 w-9">
          <AvatarImage
            src={user?.imageUrl}
            alt={user?.fullName || "User"}
          />
          {/* Fallback shows first letter if image fails to load */}
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>

        {/* User Name and Email */}
        <div className="flex-1 min-w-0">
          {/* truncate cuts off long names with ... */}
          <p className="text-sm font-medium truncate">
            {user?.fullName ||
              user?.firstName ||
              user?.emailAddresses[0]?.emailAddress}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {user?.emailAddresses[0]?.emailAddress}
          </p>
        </div>

        {/* Sign Out Button */}
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