import { mutation, query } from "./_generated/server";
import { v } from "convex/values";


// MUTATION: Get or Create Friends Conversation
// only for registered users, called when clicking a friend to chat

export const getOrCreateConversation = mutation({
  args: {
    otherUserId: v.id("users"),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) throw new Error("User not found");

    const existingConversations = await ctx.db
      .query("conversations")
      .collect();

    // only match against "friends" type conversations
    const existing = existingConversations.find((conv) => {
      return (
        conv.type === "friends" &&
        conv.participants.includes(currentUser._id) &&
        conv.participants.includes(args.otherUserId)
      );
    });

    if (existing) return existing._id;

    const conversationId = await ctx.db.insert("conversations", {
      participants: [currentUser._id, args.otherUserId],
      type: "friends",
      isActive: true,
    });

    return conversationId;
  },
});


// MUTATION: Create Random Chat Conversation
// called by matchmaking logic when two users are paired
// works for both guests and registered users

export const createRandomConversation = mutation({
  args: {
    userOneId: v.id("users"),
    userTwoId: v.id("users"),
  },

  handler: async (ctx, args) => {
    const conversationId = await ctx.db.insert("conversations", {
      participants: [args.userOneId, args.userTwoId],
      type: "random",
      isActive: true,
    });

    return conversationId;
  },
});


// MUTATION: End a Random Chat Session
// marks conversation inactive when either user disconnects or leaves

export const endRandomConversation = mutation({
  args: {
    conversationId: v.id("conversations"),
  },

  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, {
      isActive: false,
    });
  },
});


// QUERY: Get All Conversations for current registered user

export const getUserConversations = query({
  args: {},

  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) return [];

    const allConversations = await ctx.db
      .query("conversations")
      .collect();

    const myConversations = allConversations.filter((conv) =>
      conv.participants.includes(currentUser._id)
    );

    const conversationsWithDetails = await Promise.all(
      myConversations.map(async (conv) => {
        const otherUserId = conv.participants.find(
          (id) => id !== currentUser._id
        );

        const otherUser = otherUserId ? await ctx.db.get(otherUserId) : null;

        const messages = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) =>
            q.eq("conversationId", conv._id)
          )
          .order("desc")
          .take(1);

        const lastMessage = messages[0] || null;

        return {
          ...conv,
          otherUser,
          lastMessage,
        };
      })
    );

    return conversationsWithDetails.sort((a, b) => {
      const aTime = a.lastMessage?._creationTime || a._creationTime;
      const bTime = b.lastMessage?._creationTime || b._creationTime;
      return bTime - aTime;
    });
  },
});


// QUERY: Get a single conversation by ID
// used by both guest and registered users to load a chat

export const getConversationById = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.conversationId);
  },
});


// QUERY: Get conversationId between current user and another user

export const getConversationByUser = query({
  args: {
    otherUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) return null;

    const conversations = await ctx.db.query("conversations").collect();

    const existing = conversations.find(
      (conv) =>
        conv.type === "friends" &&
        conv.participants.includes(currentUser._id) &&
        conv.participants.includes(args.otherUserId)
    );

    return existing?._id || null;
  },
});