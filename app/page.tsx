"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export default function Landing() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (isLoaded && user) {
      router.push("/");
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="bg-primary h-12 w-12 rounded-full flex items-center justify-center">
            <MessageCircle className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">RealChat</h1>
          <p className="text-muted-foreground">
            Chat with strangers or friends instantly
          </p>
        </div>

        {/* Start Chatting Button */}
        <Button
          onClick={() => router.push("/chat/random")}
          size="lg"
          className="w-full"
        >
          Start Chatting as Guest
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-muted-foreground">
              or
            </span>
          </div>
        </div>

        {/* Sign In / Sign Up Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => router.push("/sign-in")}
            variant="outline"
            size="lg"
            className="w-full"
          >
            Sign In
          </Button>
          <Button
            onClick={() => router.push("/sign-up")}
            variant="outline"
            size="lg"
            className="w-full"
          >
            Create Account
          </Button>
        </div>

        {/* Footer text */}
        <p className="text-xs text-muted-foreground">
          No account needed to start chatting with strangers
        </p>
      </div>
    </div>
  );
}