
"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

export default function Home() {
  // useUser() gives us the logged-in user's info from Clerk
  const { user, isLoaded } = useUser();

  // useMutation lets us call our Convex mutation function
  const upsertUser = useMutation(api.users.upsertUser);

  useEffect(() => {
    // Wait until Clerk has loaded the user info
    // Then sync the user to our Convex database
    if (isLoaded && user) {
      upsertUser({
        clerkId: user.id,
        name: user.fullName || user.username || "Anonymous",
        email: user.emailAddresses[0]?.emailAddress || "",
        imageUrl: user.imageUrl,
      });
    }
  }, [isLoaded, user, upsertUser]);
  // The array above means "run this effect when these values change"

  // Show loading state while Clerk loads
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">
          Welcome, {user?.firstName}! 👋
        </h1>
        <p className="text-muted-foreground">
          Chat App is ready.
        </p>
      </div>
    </div>
  );
}