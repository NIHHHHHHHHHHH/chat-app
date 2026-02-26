
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatMessageTime } from "@/lib/formatTime";
import { Trash2 } from "lucide-react";
import ReactionBar from "./ReactionBar";

type MessageBubbleProps = {
  messageId: Id<"messages">;
  // The message content
  content: string;
  // Sender info
  senderName: string;
  senderImage?: string;
  // Is this message sent by the current user?
  isCurrentUser: boolean;
  // Timestamp
  createdAt: number;

  isDeleted?: boolean;
};

export default function MessageBubble({
  messageId, 
  content,
  senderName,
  senderImage,
  isCurrentUser,
  createdAt,
  isDeleted,
}: MessageBubbleProps) {

  const fallback = senderName?.charAt(0).toUpperCase() || "U";

  const formattedTime = formatMessageTime(createdAt);

  // Track hover state to show delete button
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteMessage = useMutation(api.messages.deleteMessage);

   const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteMessage({ messageId });
    } catch (error) {
      console.error("Failed to delete message:", error);
    } finally {
      setIsDeleting(false);
    }
  };

 return (
    <div
      className={`flex items-end gap-2 mb-3 group ${
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

      {/* Delete Button + Bubble + time */}
      <div
        className={`flex items-end gap-2 max-w-[70%] ${
          isCurrentUser ? "flex-row-reverse" : "flex-row"
        }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      >

        {/* Delete button — only for current user, only on hover */}
        {isCurrentUser && !isDeleted && isHovered && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
            title="Delete message"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Bubble + time */}
        <div
          className={`flex flex-col ${
            isCurrentUser ? "items-end" : "items-start"
          }`}
        >
          {/* Message bubble */}
          <div
            className={`
              px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
              ${isDeleted
                ? "bg-muted text-muted-foreground italic border border-border"
                : isCurrentUser
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-background text-foreground rounded-bl-sm border border-border"
              }
            `}
          >
            {isDeleted ? "This message was deleted" : content}
          </div>

        {/* Timestamp */}
        <span className="text-xs text-muted-foreground mt-1 px-1">
          {formattedTime}
        </span>

          {/* Reactions  */}
         <ReactionBar
           messageId={messageId}
           isCurrentUser={isCurrentUser}
           isDeleted={isDeleted}
         />
       </div>
      </div>
    </div>
  );
}