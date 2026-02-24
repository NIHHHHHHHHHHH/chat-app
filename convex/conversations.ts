
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";


// MUTATION: Get or Create Conversation

// When you click a user, this finds existing conversation
// or creates a new one between you two
export const getOrCreateConversation = mutation({
  args: {
    // The other user's ID
    otherUserId: v.id("users"),
  },

  handler: async (ctx, args) => {
    // Step 1: Get current logged in user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Step 2: Find current user in database
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) =>
        q.eq("clerkId", identity.subject)
      )
      .unique();

    if (!currentUser) throw new Error("User not found");

    // Step 3: Check if conversation already exists
    // Get all conversations and find one with both users
    const existingConversations = await ctx.db
      .query("conversations")
      .collect();

    // Find conversation that has BOTH users as participants
    const existing = existingConversations.find((conv) => {
      const participants = conv.participants;
      return (
        participants.includes(currentUser._id) &&
        participants.includes(args.otherUserId)
      );
    });

    // Step 4: If conversation exists, return its ID
    if (existing) {
      return existing._id;
    }

    // Step 5: Otherwise create a new conversation
    const conversationId = await ctx.db.insert("conversations", {
      participants: [currentUser._id, args.otherUserId],
    });

    return conversationId;
  },
});


// QUERY: Get All Conversations for current user

export const getUserConversations = query({
  args: {},

  handler: async (ctx) => {
    // Get current user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) =>
        q.eq("clerkId", identity.subject)
      )
      .unique();

    if (!currentUser) return [];

    // Get all conversations
    const allConversations = await ctx.db
      .query("conversations")
      .collect();

    // Filter only conversations where current user is a participant
    const myConversations = allConversations.filter((conv) =>
      conv.participants.includes(currentUser._id)
    );

    // For each conversation, get the other user's details
    // and the last message preview
    const conversationsWithDetails = await Promise.all(
      myConversations.map(async (conv) => {
        // Find the other participant (not current user)
        const otherUserId = conv.participants.find(
          (id) => id !== currentUser._id
        );

        // Get other user's info
        const otherUser = otherUserId
          ? await ctx.db.get(otherUserId)
          : null;

        // Get the last message in this conversation
        const messages = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) =>
            q.eq("conversationId", conv._id)
          )
          .order("desc") // newest first
          .take(1); // only get 1

        const lastMessage = messages[0] || null;

        return {
          ...conv,
          otherUser,
          lastMessage,
        };
      })
    );

    // Sort by last message time (most recent first)
    return conversationsWithDetails.sort((a, b) => {
      const aTime = a.lastMessage?._creationTime || a._creationTime;
      const bTime = b.lastMessage?._creationTime || b._creationTime;
      return bTime - aTime;
    });
  },

});

// Get conversationId between current user and another user
export const getConversationByUser = query({
  args: {
    otherUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) =>
        q.eq("clerkId", identity.subject)
      )
      .unique();

    if (!currentUser) return null;

    const conversations = await ctx.db
      .query("conversations")
      .collect();

    const existing = conversations.find((conv) =>
      conv.participants.includes(currentUser._id) &&
      conv.participants.includes(args.otherUserId)
    );

    return existing?._id || null;
  },
});