// components/ui/UnreadBadge.tsx

type UnreadBadgeProps = {
  count: number;
};

export default function UnreadBadge({ count }: UnreadBadgeProps) {
  // Don't render if no unread messages
  if (count === 0) return null;

  return (
    <span
      style={{
        backgroundColor: "#ef4444",
        color: "white",
        borderRadius: "9999px",
        fontSize: "11px",
        fontWeight: "600",
        minWidth: "18px",
        height: "18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 4px",
      }}
    >
      {/* Show 99+ if more than 99 unread */}
      {count > 99 ? "99+" : count}
    </span>
  );
}