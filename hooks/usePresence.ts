
// A custom hook that handles all presence logic
// We put this in a hook so any component can use it easily

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function usePresence() {
  const updatePresence = useMutation(api.presence.updatePresence);

  useEffect(() => {
    // Mark user as online when component mounts
    updatePresence({ isOnline: true });

    // Send heartbeat every 30 seconds
    // This keeps the user marked as online
    const heartbeat = setInterval(() => {
      updatePresence({ isOnline: true });
    }, 30000); // 30000ms = 30 seconds

    // Handle when user closes/leaves the tab
    const handleOffline = () => {
      updatePresence({ isOnline: false });
    };

    // visibilitychange fires when user switches tabs
    // or minimizes browser
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        updatePresence({ isOnline: false });
      } else {
        updatePresence({ isOnline: true });
      }
    });

    // beforeunload fires when user closes the tab
    window.addEventListener("beforeunload", handleOffline);

    // Cleanup function - runs when component unmounts
    return () => {
      clearInterval(heartbeat);
      window.removeEventListener("beforeunload", handleOffline);
      updatePresence({ isOnline: false });
    };
  }, [updatePresence]);
}