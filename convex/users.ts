import { mutation, query } from "./_generated/server";
import { v } from "convex/values";


// MUTATION: Create or Update Registered User
// called from clerk webhook/provider on sign in

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
      type: "registered",
    });

    return userId;
  },
});


// MUTATION: Create or Get Guest User
// called on landing page when user hits "start chatting"
// guestId is a random uuid generated on the client and stored in localStorage

export const upsertGuestUser = mutation({
  args: {
    guestId: v.string(),
    // guests get a random name like "Guest 4821"
    name: v.string(),
  },

  handler: async (ctx, args) => {
    const existingGuest = await ctx.db
      .query("users")
      .withIndex("by_guest_id", (q) => q.eq("guestId", args.guestId))
      .unique();

    // guest already exists (returning visitor), just return their id
    if (existingGuest) {
      return existingGuest._id;
    }

    const userId = await ctx.db.insert("users", {
      guestId: args.guestId,
      name: args.name,
      type: "guest",
    });

    return userId;
  },
});


// QUERY: Get Current Logged-in User (registered only)

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    return user;
  },
});


// QUERY: Get Guest User by their localStorage guestId

export const getGuestUser = query({
  args: {
    guestId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_guest_id", (q) => q.eq("guestId", args.guestId))
      .unique();
  },
});


// QUERY: Get All Registered Users except current user
// only registered users can search for friends
// supports search by name or email

export const getAllUsers = query({
  args: {
    searchQuery: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // only fetch registered users, guests shouldn't appear in friend search
    const allUsers = await ctx.db
      .query("users")
      .collect();

    const registeredUsers = allUsers.filter(
      (user) => user.type === "registered" && user.clerkId !== identity.subject
    );

    if (!args.searchQuery || args.searchQuery.trim() === "") {
      return registeredUsers;
    }

    const q = args.searchQuery.toLowerCase();
    return registeredUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q)
    );
  },
});


// QUERY: Get a single user by their Convex ID

export const getUserById = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});