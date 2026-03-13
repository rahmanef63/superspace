"use client"

import { useEffect } from "react"

const CHUNK_ERROR_RELOAD_KEY = "__ss_chunk_error_reloaded__"

function shouldHandleChunkError(message?: string) {
  if (!message) return false

  return (
    message.includes("ChunkLoadError") ||
    message.includes("Loading chunk") ||
    message.includes("Failed to fetch dynamically imported module")
  )
}

export function ChunkErrorHandler() {
  useEffect(() => {
    const reloadOnce = () => {
      if (sessionStorage.getItem(CHUNK_ERROR_RELOAD_KEY) === "1") return
      sessionStorage.setItem(CHUNK_ERROR_RELOAD_KEY, "1")
      window.location.reload()
    }

    const handleError = (event: ErrorEvent) => {
      if (shouldHandleChunkError(event.message)) {
        reloadOnce()
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason
      const reasonMessage =
        typeof reason === "string"
          ? reason
          : typeof reason?.message === "string"
            ? reason.message
            : ""

      if (shouldHandleChunkError(reasonMessage)) {
        reloadOnce()
      }
    }

    window.addEventListener("error", handleError)
    window.addEventListener("unhandledrejection", handleUnhandledRejection)

    return () => {
      window.removeEventListener("error", handleError)
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
    }
  }, [])

  return null
}
