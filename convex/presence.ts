// convex/presence.ts

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";


// MUTATION: Update presence (online/offline)

export const updatePresence = mutation({
  args: {
    // true = user is online, false = user is offline
    isOnline: v.boolean(),
  },

  handler: async (ctx, args) => {
    // Get current user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) =>
        q.eq("clerkId", identity.subject)
      )
      .unique();

    if (!currentUser) return;

    // Check if presence record already exists for this user
    const existingPresence = await ctx.db
      .query("presence")
      .withIndex("by_user", (q) =>
        q.eq("userId", currentUser._id)
      )
      .unique();

    if (existingPresence) {
      // Update existing presence record
      await ctx.db.patch(existingPresence._id, {
        isOnline: args.isOnline,
        // Date.now() gives current time in milliseconds
        lastSeen: Date.now(),
      });
    } else {
      // Create new presence record
      await ctx.db.insert("presence", {
        userId: currentUser._id,
        isOnline: args.isOnline,
        lastSeen: Date.now(),
      });
    }
  },
});


// QUERY: Get presence for a specific user

export const getUserPresence = query({
  args: {
    userId: v.id("users"),
  },

  handler: async (ctx, args) => {
    const presence = await ctx.db
      .query("presence")
      .withIndex("by_user", (q) =>
        q.eq("userId", args.userId)
      )
      .unique();

    // If no presence record → user has never been online
    if (!presence) return false;

    // If lastSeen was more than 35 seconds ago → offline
    // even if isOnline is true (handles browser crashes)
    const isRecentlyActive =
      Date.now() - presence.lastSeen < 35000; // 35 seconds

    return presence.isOnline && isRecentlyActive;
  },
});


// QUERY: Get presence for ALL users
// Used to show dots in the user list

export const getAllPresence = query({
  args: {},

  handler: async (ctx) => {
    const allPresence = await ctx.db
      .query("presence")
      .collect();

    // Return a map of userId → isOnline
    // This makes it easy to look up any user's status
    const presenceMap: Record<string, boolean> = {};

    for (const p of allPresence) {
      const isRecentlyActive = Date.now() - p.lastSeen < 35000;
      presenceMap[p.userId] = p.isOnline && isRecentlyActive;
    }

    return presenceMap;
  },
});