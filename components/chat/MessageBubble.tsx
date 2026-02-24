
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatMessageTime } from "@/lib/formatTime";

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

  const formattedTime = formatMessageTime(createdAt);

 return (
    <div
      className={`flex items-end gap-2 mb-3 ${
        isCurrentUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar - only for other user */}
      {!isCurrentUser && (
        <Avatar className="h-7 w-7 shrink-0 mb-1">
          <AvatarImage src={senderImage} alt={senderName} />
          <AvatarFallback
            className="bg-primary text-white text-xs font-semibold"
          >
            {fallback}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Bubble + time */}
      <div
        className={`flex flex-col max-w-[70%] ${
          isCurrentUser ? "items-end" : "items-start"
        }`}
      >
        <div
           className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
           ${isCurrentUser
             ? "bg-primary text-primary-foreground rounded-br-sm"
             : "bg-background text-foreground rounded-bl-sm border border-border"}`}
           >
           {content}
        </div>

        {/* Timestamp */}
        <span className="text-xs text-muted-foreground mt-1 px-1">
          {formattedTime}
        </span>
      </div>
    </div>
  );
}