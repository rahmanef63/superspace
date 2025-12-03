/**
 * useUploadAsset Hook
 * 
 * Hook for uploading assets to Convex storage.
 * Provides upload function with progress callback.
 * 
 * @example
 * ```tsx
 * const { upload, isUploading, error } = useUploadAsset()
 * 
 * const assetId = await upload(workspaceId, file, (progress) => {
 *   console.log(`Upload progress: ${progress}%`)
 * })
 * ```
 */

import { useState, useCallback } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"

interface UploadAssetResult {
  upload: (
    workspaceId: Id<"workspaces">,
    file: File,
    onProgress?: (progress: number) => void
  ) => Promise<string>
  isUploading: boolean
  error: Error | null
}

export function useUploadAsset(): UploadAssetResult {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  // Use the chat messages upload URL generator
  const generateUploadUrl = useMutation(api.features.chat.messages.generateUploadUrl)
  
  const upload = useCallback(async (
    workspaceId: Id<"workspaces">,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string> => {
    setIsUploading(true)
    setError(null)
    
    try {
      // Step 1: Generate upload URL from Convex
      const uploadUrl = await generateUploadUrl()
      
      // Step 2: Upload file to the URL with progress tracking
      const response = await new Promise<Response>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable && onProgress) {
            const percentComplete = Math.round((event.loaded / event.total) * 100)
            onProgress(percentComplete)
          }
        })
        
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(new Response(xhr.responseText, { status: xhr.status }))
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        })
        
        xhr.addEventListener("error", () => reject(new Error("Upload failed")))
        xhr.addEventListener("abort", () => reject(new Error("Upload aborted")))
        
        xhr.open("POST", uploadUrl)
        xhr.setRequestHeader("Content-Type", file.type)
        xhr.send(file)
      })
      
      // Step 3: Get storage ID from response
      const result = await response.json()
      const storageId = result.storageId
      
      setIsUploading(false)
      return storageId
    } catch (err) {
      const uploadError = err instanceof Error ? err : new Error("Upload failed")
      setError(uploadError)
      setIsUploading(false)
      throw uploadError
    }
  }, [generateUploadUrl])
  
  return { upload, isUploading, error }
}
