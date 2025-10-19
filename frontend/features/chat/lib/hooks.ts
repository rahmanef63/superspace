"use client"

import { useState, useEffect } from "react"

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return isOnline
}

export const useTyping = (delay = 1000) => {
  const [isTyping, setIsTyping] = useState(false)

  const startTyping = () => setIsTyping(true)
  const stopTyping = () => setIsTyping(false)

  useEffect(() => {
    if (isTyping) {
      const timer = setTimeout(() => setIsTyping(false), delay)
      return () => clearTimeout(timer)
    }
  }, [isTyping, delay])

  return { isTyping, startTyping, stopTyping }
}
