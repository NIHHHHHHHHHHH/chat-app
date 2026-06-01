import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";


// MUTATION: Join Matchmaking Queue
// called when user hits "Start Chatting" on landing page
// works for both guests and registered users

export const joinQueue = mutation({
  args: {
    userId: v.id("users"),
  },

  handler: async (ctx, args) => {
    // check if user is already in queue, avoid duplicates
    const existing = await ctx.db
      .query("matchmaking")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (existing) {
      // if they were matched before, clean up old record and rejoin
      await ctx.db.delete(existing._id);
    }

    // find the first person waiting in queue (not the user themselves)
    const waiting = await ctx.db
      .query("matchmaking")
      .withIndex("by_status", (q) => q.eq("status", "waiting"))
      .order("asc") // oldest first, fair queue
      .collect();

    const opponent = waiting.find((entry) => entry.userId !== args.userId);

    if (opponent) {
      // someone is waiting — pair them up

      // create a conversation for these two users
      const conversationId = await ctx.db.insert("conversations", {
        participants: [args.userId, opponent.userId],
        type: "random",
        isActive: true,
      });

      // mark the waiting user as matched
      await ctx.db.patch(opponent._id, {
        status: "matched",
        conversationId,
      });

      // insert current user as matched too
      await ctx.db.insert("matchmaking", {
        userId: args.userId,
        joinedAt: Date.now(),
        status: "matched",
        conversationId,
      });

      return { status: "matched", conversationId };
    }

    // nobody waiting — join the queue
    await ctx.db.insert("matchmaking", {
      userId: args.userId,
      joinedAt: Date.now(),
      status: "waiting",
    });

    return { status: "waiting", conversationId: null };
  },
});


// MUTATION: Leave Queue
// called when user navigates away or cancels matchmaking

export const leaveQueue = mutation({
  args: {
    userId: v.id("users"),
  },

  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query("matchmaking")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (entry) {
      await ctx.db.delete(entry._id);
    }
  },
});


// QUERY: Check Match Status
// client polls this to know when they've been matched
// returns conversationId once matched so client can redirect

export const getMatchStatus = query({
  args: {
    userId: v.id("users"),
  },

  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query("matchmaking")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (!entry) return { status: "not_in_queue", conversationId: null };

    return {
      status: entry.status,
      conversationId: entry.conversationId || null,
    };
  },
});


// MUTATION: Cleanup Stale Queue Entries
// removes entries older than 5 minutes (timed out users)
// call this periodically from the client or a cron job

export const cleanupStaleEntries = mutation({
  args: {},

  handler: async (ctx) => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

    const stale = await ctx.db
      .query("matchmaking")
      .withIndex("by_status", (q) => q.eq("status", "waiting"))
      .collect();

    const toDelete = stale.filter(
      (entry) => entry.joinedAt < fiveMinutesAgo
    );

    await Promise.all(toDelete.map((entry) => ctx.db.delete(entry._id)));

    return { cleaned: toDelete.length };
  },
});