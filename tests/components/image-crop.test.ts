import { describe, it, expect, vi } from "vitest"

import { getCroppedPngImage } from "@/components/ui/shadcn-io/image-crop"

describe("getCroppedPngImage", () => {
  it("reduces output size under maxImageSize (was infinite recursion before)", async () => {
    const originalCreateElement = document.createElement.bind(document)
    const createElementSpy = vi.spyOn(document, "createElement")
    const blobSizes: number[] = []

    createElementSpy.mockImplementation((tagName: string) => {
      if (tagName !== "canvas") {
        return originalCreateElement(tagName)
      }

      const ctx = {
        imageSmoothingEnabled: false,
        imageSmoothingQuality: "low",
        drawImage: vi.fn(),
      }

      const canvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => ctx),
        toBlob: (callback: (blob: Blob | null) => void) => {
          const size = Math.max(1, Math.round(canvas.width * canvas.height * 4))
          blobSizes.push(size)
          callback(new Blob([new Uint8Array(size)], { type: "image/png" }))
        },
        toDataURL: vi.fn(() => `data:image/png;base64,${canvas.width}x${canvas.height}`),
      } as unknown as HTMLCanvasElement

      return canvas
    })

    const image = {
      naturalWidth: 400,
      naturalHeight: 400,
      width: 400,
      height: 400,
    } as unknown as HTMLImageElement

    const cropped = await getCroppedPngImage(
      image,
      1,
      { unit: "px", x: 0, y: 0, width: 400, height: 400 },
      200_000
    )

    expect(cropped.startsWith("data:image/png;base64,")).toBe(true)
    expect(blobSizes.length).toBeGreaterThan(1)
    expect(blobSizes[blobSizes.length - 1]).toBeLessThanOrEqual(200_000)

    createElementSpy.mockRestore()
  })

  it("terminates and does not hang on large inputs", async () => {
    const originalCreateElement = document.createElement.bind(document)
    const createElementSpy = vi.spyOn(document, "createElement")
    const blobSizes: number[] = []

    createElementSpy.mockImplementation((tagName: string) => {
      if (tagName !== "canvas") {
        return originalCreateElement(tagName)
      }

      const ctx = {
        imageSmoothingEnabled: false,
        imageSmoothingQuality: "low",
        drawImage: vi.fn(),
      }

      const canvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => ctx),
        toBlob: (callback: (blob: Blob | null) => void) => {
          const size = Math.max(1, Math.round(canvas.width * canvas.height * 4))
          blobSizes.push(size)
          callback(new Blob([new Uint8Array(size)], { type: "image/png" }))
        },
        toDataURL: vi.fn(() => `data:image/png;base64,${canvas.width}x${canvas.height}`),
      } as unknown as HTMLCanvasElement

      return canvas
    })

    const image = {
      naturalWidth: 1000,
      naturalHeight: 1000,
      width: 1000,
      height: 1000,
    } as unknown as HTMLImageElement

    const cropped = await getCroppedPngImage(
      image,
      1,
      { unit: "px", x: 0, y: 0, width: 1000, height: 1000 },
      50_000
    )

    expect(cropped.startsWith("data:image/png;base64,")).toBe(true)
    expect(blobSizes[blobSizes.length - 1]).toBeLessThanOrEqual(50_000)

    createElementSpy.mockRestore()
  })
})
