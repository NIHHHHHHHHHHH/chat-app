

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";


// MUTATION: Toggle a reaction
// If reaction exists → remove it
// If reaction doesn't exist → add it

export const toggleReaction = mutation({
  args: {
    messageId: v.id("messages"),
    // The emoji string e.g. "👍"
    emoji: v.string(),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) =>
        q.eq("clerkId", identity.subject)
      )
      .unique();

    if (!currentUser) throw new Error("User not found");

    // Check if this user already reacted with this emoji
    const existingReactions = await ctx.db
      .query("reactions")
      .withIndex("by_message_user", (q) =>
        q
          .eq("messageId", args.messageId)
          .eq("userId", currentUser._id)
      )
      .collect();

    // Find if same emoji already exists
    const existingReaction = existingReactions.find(
      (r) => r.emoji === args.emoji
    );

    if (existingReaction) {
      // User already reacted with this emoji → REMOVE it
      // This is the toggle behavior
      await ctx.db.delete(existingReaction._id);
    } else {
      // User hasn't reacted with this emoji → ADD it
      await ctx.db.insert("reactions", {
        messageId: args.messageId,
        userId: currentUser._id,
        emoji: args.emoji,
      });
    }
  },
});


// QUERY: Get all reactions for a message
// Returns grouped by emoji with counts

export const getReactions = query({
  args: {
    messageId: v.id("messages"),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) =>
        q.eq("clerkId", identity.subject)
      )
      .unique();

    if (!currentUser) return [];

    // Get all reactions for this message
    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_message", (q) =>
        q.eq("messageId", args.messageId)
      )
      .collect();

    // Group reactions by emoji
    // e.g. { "👍": { count: 3, hasReacted: true } }
    const grouped: Record<string, { emoji: string; count: number; hasReacted: boolean }> = {};

    for (const reaction of reactions) {
      if (!grouped[reaction.emoji]) {
        grouped[reaction.emoji] = {
          emoji: reaction.emoji,
          count: 0,
          // hasReacted = did the CURRENT user react with this emoji?
          hasReacted: false,
        };
      }

      // Increment count for this emoji
      grouped[reaction.emoji].count++;

      // Check if current user is one of the reactors
      if (reaction.userId === currentUser._id) {
        grouped[reaction.emoji].hasReacted = true;
      }
    }

    // Convert object to array for easier rendering
    return Object.values(grouped);
  },
});