
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

  // Which conversation is open
  const [conversationId, setConversationId] =
    useState<Id<"conversations"> | null>(null);

  // Which user is selected
  const [selectedUserId, setSelectedUserId] =
    useState<Id<"users"> | null>(null);

  // On mobile: track if chat is showing or sidebar
  // false = show sidebar, true = show chat
  const [showChat, setShowChat] = useState(false);

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

  // When user clicks someone in sidebar
  const handleConversationSelect = (
    convId: Id<"conversations">,
    userId: Id<"users">
  ) => {
    setConversationId(convId);
    setSelectedUserId(userId);
    // On mobile → switch to chat view
    setShowChat(true);
  };

  // When user clicks back button on mobile
  const handleBack = () => {
    setShowChat(false);
  };

  return (
    <div className="flex h-screen overflow-hidden">

      {/* SIDEBAR 
          Desktop: always visible (md:flex)
          Mobile: visible only when showChat is false */}
      <div
        className={`
          ${showChat ? "hidden" : "flex"}
          md:flex
          w-full md:w-80
          flex-col
        `}
      >
        <Sidebar
          onConversationSelect={handleConversationSelect}
          selectedConversationId={conversationId}
        />
      </div>

      {/* CHAT AREA 
          Desktop: always visible (md:flex)
          Mobile: visible only when showChat is true */}
      <div
        className={`
          ${showChat ? "flex" : "hidden"}
          md:flex
          flex-1
          flex-col
          overflow-hidden
        `}
      >
        <ChatArea
          conversationId={conversationId}
          otherUserId={selectedUserId}
          onBack={handleBack}
        />
      </div>

    </div>
  );
}