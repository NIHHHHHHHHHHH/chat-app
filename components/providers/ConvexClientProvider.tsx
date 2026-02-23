
"use client";
// "use client" means this component runs in the browser, not on the server
// We need this because Convex and Clerk need browser access

import { ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";

// Create a Convex client using our URL from .env.local
// This is the connection between our app and Convex backend
const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL as string
);

export default function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // ClerkProvider wraps everything and gives access to auth state
    <ClerkProvider>
      {/* ConvexProviderWithClerk connects Convex with Clerk */}
      {/* Now every Convex request automatically includes the logged-in user's token */}
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}