import { mutation, query } from "./_generated/server";
import { v } from "convex/values";


// MUTATION: Send a Text Message
// works for both registered and guest users
// guests pass their userId directly since they have no clerk identity

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
    // for registered users leave this out, we get id from clerk identity
    // for guests pass their convex userId directly
    guestUserId: v.optional(v.id("users")),
  },

  handler: async (ctx, args) => {
    let senderId;

    if (args.guestUserId) {
      // guest user — trust the passed userId
      senderId = args.guestUserId;
    } else {
      // registered user — get from clerk identity
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new Error("Not authenticated");

      const currentUser = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique();

      if (!currentUser) throw new Error("User not found");
      senderId = currentUser._id;
    }

    if (!args.content.trim()) throw new Error("Message cannot be empty");

    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId,
      content: args.content.trim(),
      messageType: "text",
    });
  },
});


// MUTATION: Send an Image Message
// imageUrl is the cloudinary url after upload on the client

export const sendImageMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    imageUrl: v.string(),
    // optional caption alongside the image
    content: v.optional(v.string()),
    guestUserId: v.optional(v.id("users")),
  },

  handler: async (ctx, args) => {
    let senderId;

    if (args.guestUserId) {
      senderId = args.guestUserId;
    } else {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new Error("Not authenticated");

      const currentUser = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique();

      if (!currentUser) throw new Error("User not found");
      senderId = currentUser._id;
    }

    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId,
      content: args.content?.trim() || "",
      messageType: "image",
      imageUrl: args.imageUrl,
    });
  },
});


// QUERY: Get All Messages in a Conversation
// works for both guests and registered users
// no auth check — conversation access is controlled at the component level

export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },

  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .collect();

    const messagesWithSender = await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);
        return { ...message, sender };
      })
    );

    return messagesWithSender;
  },
});


// MUTATION: Soft Delete a Message
// only the sender can delete their own message
// guests can also delete their own messages

export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
    guestUserId: v.optional(v.id("users")),
  },

  handler: async (ctx, args) => {
    let currentUserId;

    if (args.guestUserId) {
      currentUserId = args.guestUserId;
    } else {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new Error("Unauthorized");

      const currentUser = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique();

      if (!currentUser) throw new Error("User not found");
      currentUserId = currentUser._id;
    }

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    if (message.senderId !== currentUserId) {
      throw new Error("You can only delete your own messages");
    }

    await ctx.db.patch(args.messageId, { isDeleted: true });
  },
});