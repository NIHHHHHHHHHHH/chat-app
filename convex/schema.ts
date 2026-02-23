// convex/schema.ts

// We import these helpers from Convex to define our table structure
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// defineSchema() tells Convex what our database looks like
// Think of it like creating a blueprint for all our tables
export default defineSchema({

  // USERS TABLE
  // Stores every person who signs up

  users: defineTable({
    // Clerk gives every user a unique ID when they sign up
    // We store it here so we can connect Clerk user → Convex user
    clerkId: v.string(),

    // User's display name (from their Clerk profile)
    name: v.string(),

    // User's profile picture URL (from Clerk or Google)
    // optional() means this field is not required
    imageUrl: v.optional(v.string()),

    // User's email address
    email: v.string(),
  })
    // index means "make searching by this field fast"
    // We'll often need to find a user by their clerkId
    .index("by_clerk_id", ["clerkId"]),

  // CONVERSATIONS TABLE
  // Stores a chat session between 2 users

  conversations: defineTable({
    // Array of exactly 2 user IDs (the two people in the chat)
    // v.id("users") means "an ID that points to the users table"
    participants: v.array(v.id("users")),
  }),

  // MESSAGES TABLE
  // Stores every message sent in a conversation

  messages: defineTable({
    // Which conversation this message belongs to
    conversationId: v.id("conversations"),

    // Who sent this message (points to users table)
    senderId: v.id("users"),

    // The actual text content of the message
    content: v.string(),
  })
    // We'll often fetch all messages in a conversation
    // so we index by conversationId for fast lookup
    .index("by_conversation", ["conversationId"]),

  // PRESENCE TABLE
  // Tracks who is online right now

  presence: defineTable({
    // Which user this presence record belongs to
    userId: v.id("users"),

    // When did they last "ping" the server
    // We use this to determine if they're still online
    // (if last ping was more than 30 seconds ago → offline)
    lastSeen: v.number(),

    // Are they currently online? true or false
    isOnline: v.boolean(),
  })
    // We'll look up presence by userId often
    .index("by_user", ["userId"]),

  // TYPING TABLE
  // Tracks who is currently typing in a conversation
  typing: defineTable({
    // Which conversation they're typing in
    conversationId: v.id("conversations"),

    // Who is typing
    userId: v.id("users"),

    // Timestamp of when they last typed
    // We use this to auto-clear the indicator after 2 seconds
    
    lastTypedAt: v.number(),
  })
    // We'll look up typing by conversation
    .index("by_conversation", ["conversationId"]),
});
