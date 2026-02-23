
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";


// MUTATION: Create or Update User

// A "mutation" is a Convex function that WRITES to the database
// This runs every time a user logs in
export const upsertUser = mutation({
  // These are the arguments this function accepts
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    // Step 1: Check if this user already exists in our database
    // We search by clerkId (the unique ID Clerk gives each user)
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    // Step 2: If user exists, update their info
    // (in case they changed their name or photo in Clerk)
    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        name: args.name,
        email: args.email,
        imageUrl: args.imageUrl,
      });
      return existingUser._id;
    }

    // Step 3: If user doesn't exist, create a new record
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      name: args.name,
      email: args.email,
      imageUrl: args.imageUrl,
    });

    return userId;
  },
});


// QUERY: Get Current Logged-in User

// A "query" is a Convex function that READS from the database
export const getCurrentUser = query({
  args: {},

  handler: async (ctx) => {
    // Get the identity of whoever is making this request
    // Convex + Clerk gives us this automatically
    const identity = await ctx.auth.getUserIdentity();

    // If no one is logged in, return null
    if (!identity) return null;

    // Find the user in our database using their Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) =>
        q.eq("clerkId", identity.subject)
      )
      .unique();

    return user;
  },
});


// QUERY: Get All Users (except current user)

export const getAllUsers = query({
  args: {},

  handler: async (ctx) => {
    // Get current logged-in user's identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // Get ALL users from database
    const allUsers = await ctx.db.query("users").collect();

    // Filter out the current user
    // We don't want to show yourself in the user list
    return allUsers.filter(
      (user) => user.clerkId !== identity.subject
    );
  },
});