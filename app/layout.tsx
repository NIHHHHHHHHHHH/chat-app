
import type { Metadata } from "next";
import "./globals.css";
import ConvexClientProvider from "@/components/providers/ConvexClientProvider";

export const metadata: Metadata = {
  title: "Chat App",
  description: "Real-time chat application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* ConvexClientProvider wraps the entire app */}
        {/* This means every page has access to Convex + Clerk */}
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}