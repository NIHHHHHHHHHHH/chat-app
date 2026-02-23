import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// MUTATION: Update typing status
export const updateTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    isTyping: v.boolean(),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) return;

    const existingTyping = await ctx.db
      .query("typing")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .filter((q) => q.eq(q.field("userId"), currentUser._id))
      .unique();

    if (args.isTyping) {
      // User is typing — upsert the record
      if (existingTyping) {
        await ctx.db.patch(existingTyping._id, {
          lastTypedAt: Date.now(),
        });
      } else {
        await ctx.db.insert("typing", {
          conversationId: args.conversationId,
          userId: currentUser._id,
          lastTypedAt: Date.now(),
        });
      }
    } else {
      // User stopped typing — DELETE the record so query reactively updates
      if (existingTyping) {
        await ctx.db.delete(existingTyping._id);
      }
    }
  },
});

// QUERY: Get who is typing in a conversation
export const getTypingUsers = query({
  args: {
    conversationId: v.id("conversations"),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) return [];

    // Only get records from the last 5 seconds (safety net for stale records)
    const cutoff = Date.now() - 1500;

    const typingRecords = await ctx.db
      .query("typing")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    const otherTypers = typingRecords.filter(
      (record) =>
        record.userId !== currentUser._id && record.lastTypedAt > cutoff
    );

    const typingUsers = await Promise.all(
      otherTypers.map(async (record) => {
        const user = await ctx.db.get(record.userId);
        return { user, lastTypedAt: record.lastTypedAt };
      })
    );

    return typingUsers.filter((t) => t.user !== null);
  },
});