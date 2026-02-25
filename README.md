# RealChat — Real-Time Chat Application

A modern, fully-featured real-time chat application  built with Next.js, Convex, and Clerk. Supports instant messaging, online presence, typing indicators, and unread message tracking — all powered by a reactive backend with zero polling.

🌐 **Live App:**  [https://chat-app-ten-xi-10.vercel.app](https://chat-app-ten-xi-10.vercel.app) <br/>
💻 **GitHub:**  [https://github.com/NIHHHHHHHHHHH/chat-app](https://github.com/NIHHHHHHHHHHH/chat-app)

---

## ✨ Features

- **Real-Time Messaging** — Messages appear instantly across all connected clients with no page refresh
- **User Authentication** — Secure sign up and sign in via Clerk with Google OAuth support
- **User Search** — Search users by name or email in real time
- **Online / Offline Presence** — Live green dot indicator with 30-second heartbeat system
- **Typing Indicator** — Animated dots appear when the other person is typing
- **Unread Message Count** — Red badge shows unread count per conversation, clears on open
- **Smart Auto-Scroll** — Auto-scrolls to latest message; shows "New Messages" button when scrolled up
- **Smart Timestamps** — Shows time only for today, date + time for older messages, full date for different year
- **Empty States** — Friendly messages and icons for all empty views
- **Responsive Layout** — Fully responsive design that works on both desktop and mobile

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router |
| **TypeScript** | Type safety across the entire codebase |
| **Convex** | Real-time backend, database, and server functions |
| **Clerk** | Authentication and user management |
| **Tailwind CSS v4** | Utility-first styling with custom design system |
| **shadcn/ui** | Accessible UI component primitives |
| **Lucide React** | Icon library |

---

## 🗄️ Database Schema

The app uses 6 Convex tables:

| Table | Purpose |
|-------|---------|
| `users` | Stores user profiles synced from Clerk |
| `conversations` | Tracks one-on-one conversations between two users |
| `messages` | Stores all messages with sender and conversation references |
| `presence` | Tracks online/offline status via last seen timestamp |
| `typing` | Stores active typing records — deleted immediately on stop |
| `conversationReads` | Tracks last read time per user per conversation for unread counts |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Convex](https://convex.dev) account
- A [Clerk](https://clerk.com) account

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/yourusername/realchat.git
cd realchat
```

**2. Install dependencies**
```bash
npm install
```

**3. Set up environment variables**

Create a `.env.local` file in the root:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
CLERK_ISSUER_URL=your_clerk_issuer_url
```

**4. Initialize Convex**
```bash
npx convex dev
```

Add `CLERK_ISSUER_URL` to your Convex dashboard environment variables as well.

**5. Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
├── app/
│   ├── (auth)/
│   │   ├── sign-in/         # Clerk sign in page
│   │   └── sign-up/         # Clerk sign up page
│   ├── (root)/
│   │   ├── layout.tsx       # Main layout with sidebar
│   │   └── page.tsx         # Main chat page
│   ├── globals.css          # Global styles and design tokens
│   └── layout.tsx           # Root layout with providers
│
├── components/
│   ├── chat/
│   │   ├── ChatArea.tsx         # Main chat view with header
│   │   ├── MessageBubble.tsx    # Individual message component
│   │   ├── MessageInput.tsx     # Message input with typing detection
│   │   ├── MessageList.tsx      # Scrollable message list
│   │   └── TypingIndicator.tsx  # Animated typing indicator
│   ├── sidebar/
│   │   ├── Sidebar.tsx          # Main sidebar component
│   │   ├── SearchBar.tsx        # User search input
│   │   └── UserList.tsx         # List of users with presence
│   ├── ui/
│   │   ├── EmptyState.tsx       # Reusable empty state component
│   │   ├── OnlineIndicator.tsx  # Green/grey presence dot
│   │   └── UnreadBadge.tsx      # Red unread count badge
│   └── providers/
│       └── ConvexClientProvider.tsx  # Convex + Clerk provider wrapper
│
├── convex/
│   ├── schema.ts            # Database schema definition
│   ├── users.ts             # User queries and mutations
│   ├── conversations.ts     # Conversation logic
│   ├── messages.ts          # Message send and fetch
│   ├── presence.ts          # Online/offline tracking
│   ├── typing.ts            # Typing indicator logic
│   ├── reads.ts             # Unread message tracking
│   └── auth.config.ts       # Clerk auth configuration
│
├── hooks/
│   ├── usePresence.ts       # Heartbeat presence hook
│   └── useAutoScroll.ts     # Smart scroll behavior hook
│
└── lib/
    └── formatTime.ts        # Smart timestamp formatting
```

---

## ⚙️ How Real-Time Works

Convex powers all real-time functionality through **reactive queries**. When data changes in the database, Convex automatically pushes updates to all subscribed clients — no WebSocket management, no polling, no manual state syncing required.

```
User sends message
       ↓
Convex mutation writes to database
       ↓
All clients subscribed via useQuery receive update
       ↓
UI updates instantly across all connected devices
```

The same pattern powers presence, typing indicators, and unread counts.

---

## 🎨 Design System

All colors are defined as CSS variables in `globals.css` and consumed via Tailwind utility classes. To change the entire color scheme, update one value:

```css
@theme {
  --primary: #2AABEE;  /* Change this → entire app updates */
}
```

---

## 📦 Deployment

The app is deployed on **Vercel** with a production Convex backend.

```bash
# Deploy Convex to production
npx convex deploy

# Push to GitHub → Vercel auto-deploys
git push origin main
```

Make sure all environment variables are configured in your Vercel project settings.

