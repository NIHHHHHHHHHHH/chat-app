
// This function takes a timestamp number and returns
// a formatted string based on how old the message is

export function formatMessageTime(timestamp: number): string {
  // Convert the number to a Date object
  const messageDate = new Date(timestamp);

  // Get today's date (at midnight for comparison)
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Get message date (at midnight for comparison)
  const msgDay = new Date(
    messageDate.getFullYear(),
    messageDate.getMonth(),
    messageDate.getDate()
  );

  // Calculate difference in days
  // getTime() converts date to milliseconds
  const diffInDays = Math.floor(
    (today.getTime() - msgDay.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Format the time part → "2:34 PM"
  const timeStr = messageDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Same day → show time only
  if (diffInDays === 0) {
    return timeStr;
  }

  // Different year → show full date + time
  if (messageDate.getFullYear() !== now.getFullYear()) {
    const dateStr = messageDate.toLocaleDateString([], {
      month: "short", // "Feb"
      day: "numeric", // "15"
      year: "numeric", // "2024"
    });
    return `${dateStr}, ${timeStr}`;
  }

  // Same year but older → show date + time (no year)
  const dateStr = messageDate.toLocaleDateString([], {
    month: "short", // "Feb"
    day: "numeric", // "15"
  });
  return `${dateStr}, ${timeStr}`;
}

// This function formats time for conversation list preview
// Shows "2:34 PM" for today, "Feb 15" for older
export function formatConversationTime(timestamp: number): string {
  const messageDate = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(
    messageDate.getFullYear(),
    messageDate.getMonth(),
    messageDate.getDate()
  );

  const diffInDays = Math.floor(
    (today.getTime() - msgDay.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Today → show time only
  if (diffInDays === 0) {
    return messageDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // This week → show day name "Mon", "Tue"
  if (diffInDays < 7) {
    return messageDate.toLocaleDateString([], { weekday: "short" });
  }

  // Older → show date "Feb 15"
  return messageDate.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}
