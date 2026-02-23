

type OnlineIndicatorProps = {
  isOnline: boolean;
  size?: "sm" | "md";
};

export default function OnlineIndicator({
  isOnline,
  size = "sm",
}: OnlineIndicatorProps) {
  return (
    <span
      style={{
        width: size === "sm" ? "10px" : "12px",
        height: size === "sm" ? "10px" : "12px",
        borderRadius: "50%",
        border: "2px solid white",
        display: "block",
        backgroundColor: isOnline ? "#22c55e" : "#d1d5db",
      }}
    />
  );
}