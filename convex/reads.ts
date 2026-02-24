// convex/reads.ts

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";


// MUTATION: Mark conversation as read
// Called when user opens a conversation

export const markConversationRead = mutation({
  args: {
    conversationId: v.id("conversations"),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) =>
        q.eq("clerkId", identity.subject)
      )
      .unique();

    if (!currentUser) return;

    // Check if read record exists
    const existingRead = await ctx.db
      .query("conversationReads")
      .withIndex("by_user_conversation", (q) =>
        q
          .eq("userId", currentUser._id)
          .eq("conversationId", args.conversationId)
      )
      .unique();

    // Update or create read timestamp
    if (existingRead) {
      await ctx.db.patch(existingRead._id, {
        lastReadTime: Date.now(),
      });
    } else {
      await ctx.db.insert("conversationReads", {
        conversationId: args.conversationId,
        userId: currentUser._id,
        lastReadTime: Date.now(),
      });
    }
  },
});


// QUERY: Get unread count for a conversation

export const getUnreadCount = query({
  args: {
    conversationId: v.id("conversations"),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) =>
        q.eq("clerkId", identity.subject)
      )
      .unique();

    if (!currentUser) return 0;

    // Get when user last read this conversation
    const readRecord = await ctx.db
      .query("conversationReads")
      .withIndex("by_user_conversation", (q) =>
        q
          .eq("userId", currentUser._id)
          .eq("conversationId", args.conversationId)
      )
      .unique();

    // If never read → all messages are unread
    const lastReadTime = readRecord?.lastReadTime || 0;

    // Get all messages in this conversation
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    // Count messages that:
    // 1. Were created after lastReadTime
    // 2. Were NOT sent by current user
    const unreadCount = messages.filter(
      (msg) =>
        msg._creationTime > lastReadTime &&
        msg.senderId !== currentUser._id
    ).length;

    return unreadCount;
  },
});