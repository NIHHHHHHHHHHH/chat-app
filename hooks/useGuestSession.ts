import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";


// generates a random guest name like "Guest 4821"
function generateGuestName() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `Guest ${num}`;
}

// generates a random uuid for guest identity
function generateGuestId() {
  return crypto.randomUUID();
}

const GUEST_ID_KEY = "chat_guest_id";
const GUEST_NAME_KEY = "chat_guest_name";


export function useGuestSession() {
  const [guestId, setGuestId] = useState<string | null>(null);
  const [guestName, setGuestName] = useState<string | null>(null);
  const [convexUserId, setConvexUserId] = useState<Id<"users"> | null>(null);
  const [isReady, setIsReady] = useState(false);

  const upsertGuestUser = useMutation(api.users.upsertGuestUser);

  useEffect(() => {
    async function initGuest() {
      // check localStorage for existing guest session
      let id = localStorage.getItem(GUEST_ID_KEY);
      let name = localStorage.getItem(GUEST_NAME_KEY);

      // first time visitor — generate and store
      if (!id) {
        id = generateGuestId();
        localStorage.setItem(GUEST_ID_KEY, id);
      }

      if (!name) {
        name = generateGuestName();
        localStorage.setItem(GUEST_NAME_KEY, name);
      }

      setGuestId(id);
      setGuestName(name);

      // create or get the convex user record for this guest
      const userId = await upsertGuestUser({ guestId: id, name });
      setConvexUserId(userId);
      setIsReady(true);
    }

    initGuest();
  }, []);

  // clears guest session from localStorage
  // useful if guest creates an account
  function clearGuestSession() {
    localStorage.removeItem(GUEST_ID_KEY);
    localStorage.removeItem(GUEST_NAME_KEY);
    setGuestId(null);
    setGuestName(null);
    setConvexUserId(null);
    setIsReady(false);
  }

  return {
    guestId,
    guestName,
    convexUserId,
    // true once convex user record is created and ready to use
    isReady,
    clearGuestSession,
  };
}