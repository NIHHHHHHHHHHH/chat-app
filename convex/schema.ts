import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({

  // USERS TABLE
  // handles both registered (clerk) and anonymous (guest) users
  users: defineTable({
    // only set for registered users, guests won't have this
    clerkId: v.optional(v.string()),

    name: v.string(),
    imageUrl: v.optional(v.string()),

    // only set for registered users
    email: v.optional(v.string()),

    // "registered" = signed in via clerk
    // "guest" = anonymous, has a guestId in localStorage
    type: v.optional(v.union(v.literal("registered"), v.literal("guest"))),

    // random uuid we generate on the client and store in localStorage
    // only set for guests, used to identify them across page refreshes
    guestId: v.optional(v.string()),
  })
    .index("by_clerk_id", ["clerkId"])
    // so we can look up a guest by their localStorage id
    .index("by_guest_id", ["guestId"]),


  // CONVERSATIONS TABLE
  conversations: defineTable({
    participants: v.array(v.id("users")),

    // "random" = matched via matchmaking queue (can be guests or registered)
    // "friends" = explicitly added friends (registered users only)
    type: v.optional(v.union(v.literal("random"), v.literal("friends"))),

    // random chat sessions end when either user disconnects
    // we mark them inactive instead of deleting so messages persist
    isActive: v.optional(v.boolean()),
  }),


  // MESSAGES TABLE
  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),

    // "text" = regular message
    // "image" = cloudinary image upload
    messageType: v.optional(v.union(v.literal("text"), v.literal("image"))),

    // only set when messageType is "image"
    // this is the cloudinary url
    imageUrl: v.optional(v.string()),

    isDeleted: v.optional(v.boolean()),
  })
    .index("by_conversation", ["conversationId"]),


  // PRESENCE TABLE
  presence: defineTable({
    userId: v.id("users"),
    lastSeen: v.number(),
    isOnline: v.boolean(),
  })
    .index("by_user", ["userId"]),


  // TYPING TABLE
  typing: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    lastTypedAt: v.number(),
  })
    .index("by_conversation", ["conversationId"]),


  // CONVERSATION READS TABLE
  conversationReads: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    lastReadTime: v.number(),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_user_conversation", ["userId", "conversationId"]),


  // REACTIONS TABLE
  reactions: defineTable({
    messageId: v.id("messages"),
    userId: v.id("users"),
    emoji: v.string(),
  })
    .index("by_message", ["messageId"])
    .index("by_message_user", ["messageId", "userId"]),


  // MATCHMAKING TABLE
  // queue of users waiting to be matched with a stranger
  // both guests and registered users can join
  matchmaking: defineTable({
    userId: v.id("users"),

    // when they joined the queue, used for timeout/ordering
    joinedAt: v.number(),

    // "waiting" = sitting in queue
    // "matched" = paired with someone, conversation created
    status: v.union(v.literal("waiting"), v.literal("matched")),

    // set once matched, points to the conversation created for them
    conversationId: v.optional(v.id("conversations")),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),


  // FRIENDS TABLE
  // tracks friend relationships between registered users
  friends: defineTable({
    // who sent the request
    requesterId: v.id("users"),

    // who received the request
    receiverId: v.id("users"),

    // "pending" = request sent, not yet accepted
    // "accepted" = friends
    // "rejected" = declined (we keep record so requester can't spam)
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected")
    ),
  })
    .index("by_requester", ["requesterId"])
    .index("by_receiver", ["receiverId"])
    // lets us check if friendship exists between two specific users fast
    .index("by_requester_receiver", ["requesterId", "receiverId"]),

});