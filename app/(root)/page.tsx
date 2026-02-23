
"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Sidebar from "@/components/sidebar/Sidebar";
import ChatArea from "@/components/chat/ChatArea";

export default function Home() {
  const { user, isLoaded } = useUser();
  const upsertUser = useMutation(api.users.upsertUser);

  // These states control which conversation is open
  const [conversationId, setConversationId] =
    useState<Id<"conversations"> | null>(null);
  const [selectedUserId, setSelectedUserId] =
    useState<Id<"users"> | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      upsertUser({
        clerkId: user.id,
        name: user.fullName || user.username || "Anonymous",
        email: user.emailAddresses[0]?.emailAddress || "",
        imageUrl: user.imageUrl,
      });
    }
  }, [isLoaded, user, upsertUser]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    // Full screen flex layout
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        onConversationSelect={(convId, userId) => {
          setConversationId(convId);
          setSelectedUserId(userId);
        }}
        selectedConversationId={conversationId}
      />
      <main className="flex-1 h-full overflow-hidden">
        <ChatArea
          conversationId={conversationId}
          otherUserId={selectedUserId}
        />
      </main>
    </div>
  );
}