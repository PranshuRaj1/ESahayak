"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Upload, X } from "lucide-react"

interface DropzoneProps {
  onFileSelect: (file: File) => void
  accept?: string
  maxSize?: number
  className?: string
  children?: React.ReactNode
}

export function Dropzone({
  onFileSelect,
  accept = ".csv",
  maxSize = 5 * 1024 * 1024,
  className,
  children,
}: DropzoneProps) {
  const [isDragOver, setIsDragOver] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const validateFile = React.useCallback(
    (file: File) => {
      if (maxSize && file.size > maxSize) {
        setError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`)
        return false
      }

      if (accept && !accept.split(",").some((type) => file.name.toLowerCase().endsWith(type.trim()))) {
        setError(`File type must be ${accept}`)
        return false
      }

      setError(null)
      return true
    },
    [accept, maxSize],
  )

  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        const file = files[0]
        if (validateFile(file)) {
          onFileSelect(file)
        }
      }
    },
    [onFileSelect, validateFile],
  )

  const handleFileInput = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      if (files.length > 0) {
        const file = files[0]
        if (validateFile(file)) {
          onFileSelect(file)
        }
      }
    },
    [onFileSelect, validateFile],
  )

  const handleClick = React.useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div className={cn("relative", className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={cn(
          "flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50",
        )}
      >
        {children || (
          <>
            <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
            <p className="mb-2 text-sm text-muted-foreground">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">CSV files only (MAX. 5MB)</p>
          </>
        )}
      </div>

      <input ref={fileInputRef} type="file" accept={accept} onChange={handleFileInput} className="hidden" />

      {error && (
        <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2">
          <X className="h-4 w-4 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  )
}
