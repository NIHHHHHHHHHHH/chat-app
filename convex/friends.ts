
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";


// MUTATION: Send Friend Request

export const sendFriendRequest = mutation({
  args: {
    receiverId: v.id("users"),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) throw new Error("User not found");

    // can't send request to yourself
    if (currentUser._id === args.receiverId) {
      throw new Error("Cannot send friend request to yourself");
    }

    // check if a request already exists in either direction
    const existingRequest = await ctx.db
      .query("friends")
      .withIndex("by_requester_receiver", (q) =>
        q.eq("requesterId", currentUser._id).eq("receiverId", args.receiverId)
      )
      .unique();

    // also check reverse direction
    const reverseRequest = await ctx.db
      .query("friends")
      .withIndex("by_requester_receiver", (q) =>
        q.eq("requesterId", args.receiverId).eq("receiverId", currentUser._id)
      )
      .unique();

    if (existingRequest || reverseRequest) {
      throw new Error("Friend request already exists");
    }

    await ctx.db.insert("friends", {
      requesterId: currentUser._id,
      receiverId: args.receiverId,
      status: "pending",
    });
  },
});


// MUTATION: Accept Friend Request

export const acceptFriendRequest = mutation({
  args: {
    requestId: v.id("friends"),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) throw new Error("User not found");

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found");

    // only the receiver can accept
    if (request.receiverId !== currentUser._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.requestId, { status: "accepted" });
  },
});


// MUTATION: Reject Friend Request

export const rejectFriendRequest = mutation({
  args: {
    requestId: v.id("friends"),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) throw new Error("User not found");

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found");

    if (request.receiverId !== currentUser._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.requestId, { status: "rejected" });
  },
});


// MUTATION: Remove Friend
// deletes the friendship record entirely

export const removeFriend = mutation({
  args: {
    friendId: v.id("users"),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) throw new Error("User not found");

    // find the friendship record in either direction
    const friendship =
      (await ctx.db
        .query("friends")
        .withIndex("by_requester_receiver", (q) =>
          q.eq("requesterId", currentUser._id).eq("receiverId", args.friendId)
        )
        .unique()) ||
      (await ctx.db
        .query("friends")
        .withIndex("by_requester_receiver", (q) =>
          q.eq("requesterId", args.friendId).eq("receiverId", currentUser._id)
        )
        .unique());

    if (friendship) {
      await ctx.db.delete(friendship._id);
    }
  },
});


// QUERY: Get My Friends List
// returns all accepted friendships with the other user's details

export const getMyFriends = query({
  args: {},

  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) return [];

    // get friendships where current user is requester
    const sent = await ctx.db
      .query("friends")
      .withIndex("by_requester", (q) => q.eq("requesterId", currentUser._id))
      .collect();

    // get friendships where current user is receiver
    const received = await ctx.db
      .query("friends")
      .withIndex("by_receiver", (q) => q.eq("receiverId", currentUser._id))
      .collect();

    const allFriendships = [...sent, ...received].filter(
      (f) => f.status === "accepted"
    );

    // get the other user's details for each friendship
    const friends = await Promise.all(
      allFriendships.map(async (f) => {
        const friendId =
          f.requesterId === currentUser._id ? f.receiverId : f.requesterId;
        const friend = await ctx.db.get(friendId);
        return { ...f, friend };
      })
    );

    return friends.filter((f) => f.friend !== null);
  },
});


// QUERY: Get Pending Friend Requests (received)
// shown as notifications/requests inbox

export const getPendingRequests = query({
  args: {},

  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) return [];

    const pending = await ctx.db
      .query("friends")
      .withIndex("by_receiver", (q) => q.eq("receiverId", currentUser._id))
      .collect();

    const pendingRequests = pending.filter((f) => f.status === "pending");

    // attach the requester's user details
    const requestsWithDetails = await Promise.all(
      pendingRequests.map(async (req) => {
        const requester = await ctx.db.get(req.requesterId);
        return { ...req, requester };
      })
    );

    return requestsWithDetails.filter((r) => r.requester !== null);
  },
});


// QUERY: Check friendship status between current user and another user
// useful for showing "Add Friend" / "Pending" / "Friends" button states

export const getFriendshipStatus = query({
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

    const sent = await ctx.db
      .query("friends")
      .withIndex("by_requester_receiver", (q) =>
        q.eq("requesterId", currentUser._id).eq("receiverId", args.otherUserId)
      )
      .unique();

    if (sent) return { status: sent.status, direction: "sent", id: sent._id };

    const received = await ctx.db
      .query("friends")
      .withIndex("by_requester_receiver", (q) =>
        q.eq("requesterId", args.otherUserId).eq("receiverId", currentUser._id)
      )
      .unique();

    if (received) return { status: received.status, direction: "received", id: received._id };

    return { status: "none", direction: null, id: null };
  },
});