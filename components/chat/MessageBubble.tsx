
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type MessageBubbleProps = {
  // The message content
  content: string;
  // Sender info
  senderName: string;
  senderImage?: string;
  // Is this message sent by the current user?
  isCurrentUser: boolean;
  // Timestamp
  createdAt: number;
};

export default function MessageBubble({
  content,
  senderName,
  senderImage,
  isCurrentUser,
  createdAt,
}: MessageBubbleProps) {
  const fallback = senderName?.charAt(0).toUpperCase() || "U";

  // Format time - we'll improve this
  const time = new Date(createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    // flex-row-reverse flips layout for current user's messages
    <div
      className={`flex items-end gap-2 mb-4 ${
        isCurrentUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar - hidden for current user */}
      {!isCurrentUser && (
        <Avatar className="h-7 w-7 shrink-0">
          <AvatarImage src={senderImage} alt={senderName} />
          <AvatarFallback className="text-xs">{fallback}</AvatarFallback>
        </Avatar>
      )}

      {/* Message bubble + time */}
      <div
        className={`flex flex-col max-w-[70%] ${
          isCurrentUser ? "items-end" : "items-start"
        }`}
      >
        {/* Message bubble */}
        <div
          className={`
            px-4 py-2 rounded-2xl text-sm
            ${isCurrentUser
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-muted text-foreground rounded-bl-sm"
            }
          `}
        >
          {content}
        </div>

        {/* Timestamp */}
        <span className="text-xs text-muted-foreground mt-1 px-1">
          {time}
        </span>
      </div>
    </div>
  );
}