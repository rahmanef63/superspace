export const formatMessageTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export const truncateMessage = (message: string, maxLength = 50): string => {
  if (message.length <= maxLength) return message
  return message.substring(0, maxLength) + "..."
}

export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .substring(0, 2)
}
