// convex/users.ts

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";


// MUTATION: Create or Update User

export const upsertUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        name: args.name,
        email: args.email,
        imageUrl: args.imageUrl,
      });
      return existingUser._id;
    }

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

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) =>
        q.eq("clerkId", identity.subject)
      )
      .unique();

    return user;
  },
});


// QUERY: Get All Users except current user
// Now supports search by name

export const getAllUsers = query({
  // searchQuery is optional - empty string means show all users
  args: {
    searchQuery: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // Get ALL users from database
    const allUsers = await ctx.db.query("users").collect();

    // Filter out the current user
    const otherUsers = allUsers.filter(
      (user) => user.clerkId !== identity.subject
    );

    // If no search query → return all other users
    if (!args.searchQuery || args.searchQuery.trim() === "") {
      return otherUsers;
    }

    // If search query exists → filter by name
    // toLowerCase() makes search case-insensitive
    // "john" will match "John", "JOHN", "john"
    const query = args.searchQuery.toLowerCase();
    return otherUsers.filter((user) =>
      user.name.toLowerCase().includes(query)
    );
  },
});


// QUERY: Get a single user by their ID

export const getUserById = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});